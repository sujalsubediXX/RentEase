import mongoose from "mongoose";
import type { PipelineStage } from "mongoose";

import Item from "../models/items.model.ts";
import Rentals from "../models/Rentals.model.ts";
import Wishlist from "../models/Wishlist.ts";

const RENTALS_COLLECTION = "rentals";
const WISHLISTS_COLLECTION = "wishlists";
const RATINGS_COLLECTION = "ratings"; // adjust once you confirm this model
const ITEM_IMAGES_COLLECTION = "itemimages"; // confirm this matches your actual collection name

const RATING_ITEM_FIELD = "itemId"; // adjust once you confirm this model

// Only these statuses represent real demand — a pending/cancelled/rejected
// rental never actually happened and shouldn't boost an item's ranking.
const QUALIFYING_RENTAL_STATUSES = ["confirmed", "ongoing", "completed"];

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

/**
 * Strategy 2 — Content-based recommendation.
 */
export async function getRecommendedForUser(userId: string, limit = 8) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [rentals, wishlistDoc] = await Promise.all([
    Rentals.find({ userId: userObjectId }).select("itemId").lean(),
    Wishlist.findOne({ userId: userObjectId }).select("items").lean(),
  ]);

  const seenItemIds: mongoose.Types.ObjectId[] = [
    ...rentals.map((r: any) => r.itemId),
    ...((wishlistDoc as any)?.items ?? []),
  ];

  if (seenItemIds.length === 0) {
    return getFeaturedItems(limit);
  }

  const seenItems = await Item.find({ _id: { $in: seenItemIds } })
    .select("categoryId")
    .lean();

  const categoryCounts = new Map<string, number>();
  for (const item of seenItems) {
    const key = String((item as any).categoryId);
    categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
  }

  const topCategoryIds = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => new mongoose.Types.ObjectId(id));

  if (topCategoryIds.length === 0) {
    return getFeaturedItems(limit);
  }

  const pipeline = [
    ...buildScoringPipeline({
      categoryId: { $in: topCategoryIds },
      _id: { $nin: seenItemIds },
    }),
    { $limit: limit },
  ];

  const results = await Item.aggregate(pipeline);

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