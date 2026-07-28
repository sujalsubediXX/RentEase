import mongoose from "mongoose";
import type { PipelineStage } from "mongoose";

import Item from "../models/items.model.ts";
import Rentals from "../models/Rentals.model.ts";
import Wishlist from "../models/Wishlist.ts";

const RENTALS_COLLECTION = "rentals";
const WISHLISTS_COLLECTION = "wishlists";
const ITEM_IMAGES_COLLECTION = "itemimages"; // confirm this matches your actual collection name

const RATINGS_COLLECTION = "itemratings"; // matches mongoose.model('ItemRating', ...)
const RATING_ITEM_FIELD = "itemID"; // matches your schema field name

// Only these statuses represent real demand — a pending/cancelled/rejected
// rental never actually happened and shouldn't boost an item's ranking.
// `as const` keeps this as a tuple of string literals (not string[]) so it's
// assignable to Mongoose's typed $in on the `status` enum field.
// Use statuses that exist on the Rentals schema. 'confirmed' was invalid
// according to the Rentals type; replace with 'approved'.
const QUALIFYING_RENTAL_STATUSES = ["approved", "ongoing", "completed"] as const;

// Scoring weights — tune based on what matters most for your platform.
const WEIGHTS = {
  rentalUnits: 3,
  wishlist: 1.5,
  rating: 2,
};
const AGE_GRAVITY = 1.5;

/**
 * Shared aggregation stages that compute rental demand, wishlist count, rating,
 * images, and a final trendScore for each item. Takes an optional $match to
 * narrow the candidate pool (e.g. to specific categories) before scoring.
 */
function buildScoringPipeline(preMatch: Record<string, any> = {}): PipelineStage[] {
  return [
    {
      $match: {
        // isActive: true,
        isApproved: true,
        availability: { $ne: "unavailable" },
        quantity: { $gt: 0 },
        ...preMatch,
      },
    },

    {
      $lookup: {
        from: RENTALS_COLLECTION,
        let: { itemId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$itemId", "$$itemId"] },
              status: { $in: QUALIFYING_RENTAL_STATUSES },
            },
          },
          { $project: { quantity: 1 } },
        ],
        as: "qualifyingRentals",
      },
    },
    {
      $lookup: {
        from: WISHLISTS_COLLECTION,
        let: { itemId: "$_id" },
        pipeline: [
          { $unwind: "$items" },
          { $match: { $expr: { $eq: ["$items", "$$itemId"] } } },
        ],
        as: "wishlistHits",
      },
    },
    {
      $lookup: {
        from: RATINGS_COLLECTION,
        localField: "_id",
        foreignField: RATING_ITEM_FIELD,
        as: "ratings",
      },
    },
    // NEW: pull in images the same way the manual controllers (getItems, etc.) do,
    // so the featured/recommended endpoints stop returning items with no images.
    {
      $lookup: {
        from: ITEM_IMAGES_COLLECTION,
        let: { itemId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$itemId", "$$itemId"] } } },
          { $sort: { displayOrder: 1 } },
          { $project: { imageUrl: 1, isPrimary: 1, _id: 0 } },
        ],
        as: "itemImages",
      },
    },

    {
      $addFields: {
        rentalUnits: { $sum: "$qualifyingRentals.quantity" },
        wishlistCount: { $size: "$wishlistHits" },
        reviewCount: { $size: "$ratings" },
        avgRating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] },
        ageInDays: {
          $divide: [{ $subtract: ["$$NOW", "$createdAt"] }, 1000 * 60 * 60 * 24],
        },
        // Flatten to a plain array of URL strings, matching the shape the
        // frontend already expects from getItems/getItemsByCategoryId.
        images: "$itemImages.imageUrl",
        primaryImage: {
          $ifNull: [
            {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$itemImages",
                    cond: { $eq: ["$$this.isPrimary", true] },
                  },
                },
                0,
              ],
            },
            { $arrayElemAt: ["$itemImages", 0] },
          ],
        },
      },
    },
    // primaryImage above is currently an object ({ imageUrl, isPrimary }) or null —
    // flatten it to a plain string to match the other controllers' output shape.
    {
      $addFields: {
        primaryImage: "$primaryImage.imageUrl",
      },
    },

    {
      $addFields: {
        trendScore: {
          $divide: [
            {
              $add: [
                { $multiply: [WEIGHTS.rentalUnits, "$rentalUnits"] },
                { $multiply: [WEIGHTS.wishlist, "$wishlistCount"] },
                { $multiply: [WEIGHTS.rating, "$avgRating", "$reviewCount"] },
              ],
            },
            { $pow: [{ $add: ["$ageInDays", 2] }, AGE_GRAVITY] },
          ],
        },
      },
    },

    { $sort: { trendScore: -1 } },

    {
      $project: {
        qualifyingRentals: 0,
        wishlistHits: 0,
        ratings: 0,
        itemImages: 0,
      },
    },
  ];
}

// ── In-memory TTL cache ──────────────────────────────────────────────────
const cache = new Map<string, { data: any[]; expiresAt: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCached(key: string) {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.data;
  return null;
}
function setCached(key: string, data: any[]) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * Strategy 1 — Trending / Featured (non-personalized).
 */
export async function getFeaturedItems(limit = 8) {
  const cacheKey = `featured:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const pipeline = [...buildScoringPipeline(), { $limit: limit }];
  const results = await Item.aggregate(pipeline);

  setCached(cacheKey, results);
  return results;
}

// ── Content-based filtering (cosine similarity) ──────────────────────────

const CONDITION_ORDER: Record<string, number> = {
  old: 0,
  used: 0.33,
  "like new": 0.66,
  new: 1,
};

interface VectorContext {
  categoryIndex: Map<string, number>;
  numCategories: number;
  minPrice: number;
  maxPrice: number;
}

function buildItemVector(item: any, ctx: VectorContext): number[] {
  // Layout: [ ...one-hot categories, normalizedPrice, conditionScore ]
  const vec = new Array(ctx.numCategories + 2).fill(0);

  const catIdx = ctx.categoryIndex.get(String(item.categoryId));
  if (catIdx !== undefined) vec[catIdx] = 1;

  const priceRange = ctx.maxPrice - ctx.minPrice || 1;
  vec[ctx.numCategories] = (item.price - ctx.minPrice) / priceRange;

  vec[ctx.numCategories + 1] = CONDITION_ORDER[item.condition] ?? 0.33;

  return vec;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Strategy 2 — Content-based recommendation via cosine similarity.
 * Builds a user profile vector from their rental/wishlist history
 * (category one-hot + normalized price + condition), then ranks
 * candidate items by similarity to that profile.
 */
export async function getRecommendedForUser(userId: string, limit = 8) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [rentals, wishlistDoc] = await Promise.all([
    Rentals.find({
      userId: userObjectId,
      status: { $in: QUALIFYING_RENTAL_STATUSES },
    })
      .select("itemId")
      .lean(),
    Wishlist.findOne({ userId: userObjectId }).select("items").lean(),
  ]);

  const rentedItemIds = rentals.map((r: any) => r.itemId);
  const wishlistedItemIds: mongoose.Types.ObjectId[] =
    (wishlistDoc as any)?.items ?? [];
  const seenItemIds = [...rentedItemIds, ...wishlistedItemIds];

  if (seenItemIds.length === 0) {
    return getFeaturedItems(limit);
  }

  const seenItems = await Item.find({ _id: { $in: seenItemIds } })
    .select("categoryId price condition")
    .lean();

  if (seenItems.length === 0) {
    return getFeaturedItems(limit);
  }

  const candidates = await Item.aggregate(
    buildScoringPipeline({ _id: { $nin: seenItemIds } })
  );

  if (candidates.length === 0) {
    return getFeaturedItems(limit);
  }

  // Shared category index across seen + candidate items
  const allCategoryIds = new Set<string>();
  seenItems.forEach((i: any) => allCategoryIds.add(String(i.categoryId)));
  candidates.forEach((i: any) => allCategoryIds.add(String(i.categoryId)));
  const categoryIndex = new Map<string, number>();
  [...allCategoryIds].forEach((id, idx) => categoryIndex.set(id, idx));

  const allPrices: number[] = [
    ...seenItems.map((i: any) => i.price),
    ...candidates.map((i: any) => i.price),
  ];
  const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 0;

  const ctx: VectorContext = {
    categoryIndex,
    numCategories: categoryIndex.size,
    minPrice,
    maxPrice,
  };

  // Weighted average of seen items → user profile vector
  const vecLength = ctx.numCategories + 2;
  const userVector: number[] = new Array(vecLength).fill(0);
  const rentedIdSet = new Set(rentedItemIds.map(String));
  let totalWeight = 0;

  for (const item of seenItems) {
    const weight = rentedIdSet.has(String(item._id)) ? 2 : 1;
    const v = buildItemVector(item, ctx);
    for (let i = 0; i < vecLength; i++) {
      userVector[i] = (userVector[i] ?? 0) + (v[i] ?? 0) * weight;
    }
    totalWeight += weight;
  }
  for (let i = 0; i < vecLength; i++) {
    userVector[i] = (userVector[i] ?? 0) / (totalWeight || 1);
  }

  // Normalize trendScore across the candidate pool so it blends fairly
  const trendScores: number[] = candidates.map((i: any) => i.trendScore ?? 0);
  const minTrend = trendScores.length ? Math.min(...trendScores) : 0;
  const maxTrend = trendScores.length ? Math.max(...trendScores) : 0;
  const trendRange = maxTrend - minTrend || 1;

  const scored = candidates.map((item: any) => {
    const similarity = cosineSimilarity(userVector, buildItemVector(item, ctx));
    const normalizedTrend = ((item.trendScore ?? 0) - minTrend) / trendRange;
    const blendedScore = similarity * 0.75 + normalizedTrend * 0.25;
    return { ...item, contentSimilarity: similarity, blendedScore };
  });

  scored.sort((a, b) => b.blendedScore - a.blendedScore);
  const results = scored.slice(0, limit);

  if (results.length < limit) {
    const excludeIds = [...seenItemIds, ...results.map((r: any) => r._id)];
    const topUp = await Item.aggregate([
      ...buildScoringPipeline({ _id: { $nin: excludeIds } }),
      { $limit: limit - results.length },
    ]);
    return [...results, ...topUp];
  }

  return results;
}

/**
 * Strategy 3 — Pure "most rented" ranking, independent of the trend/decay
 * score above. Useful for a dedicated "Most Rented" row that shouldn't be
 * affected by recency weighting the way trending is.
 */
export async function getMostRentedItems(limit = 8) {
  const cacheKey = `mostRented:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const pipeline: PipelineStage[] = [
    ...buildScoringPipeline(),
    { $sort: { rentalUnits: -1 } },
    { $limit: limit },
  ];

  const results = await Item.aggregate(pipeline);
  setCached(cacheKey, results);
  return results;
}