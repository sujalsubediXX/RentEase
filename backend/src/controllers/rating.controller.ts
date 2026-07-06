import type { Request, Response } from "express";
import Rentals from "../models/Rentals.model.ts";
import ItemRating from "../models/itemRating.model.ts";
import Item from "../models/items.model.ts";
import mongoose from 'mongoose';

export const createReview = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { rentalId, rating, message } = req.body;

  const rental = await Rentals.findById(rentalId);
  if (!rental) return res.status(404).json({ error: 'Booking not found' });

  if (rental.userId.toString() !== userId) {
    return res.status(403).json({ error: 'Not authorized to review this booking' });
  }
  if (rental.status !== 'completed') {
    return res.status(400).json({ error: 'You can only review completed rentals' });
  }

  const item = await Item.findById(rental.itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  try {
    const review = await ItemRating.create({
      rentalID: rental._id,
      itemID: rental.itemId,
      userID: userId,
      ownerID: item.ownerId,
      rating,
      message,
    });

    // match field must be itemID now, not item
    const stats = await ItemRating.aggregate([
      { $match: { itemID: rental.itemId } },
      { $group: { _id: '$itemID', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    await Item.findByIdAndUpdate(rental.itemId, {
      avgRating: stats[0]?.avg ?? 0,
      reviewCount: stats[0]?.count ?? 0,
    });

    res.status(201).json(review);
  } catch (err: any) {
    console.error("Review creation failed:", err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You already reviewed this booking' });
    }
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

export const getItemReviews = async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const itemIdStr = Array.isArray(itemId) ? itemId[0] : itemId;
  if (!itemIdStr) return res.status(400).json({ error: 'Item id required' });

  let itemObjectId;
  try {
    itemObjectId = new mongoose.Types.ObjectId(itemIdStr);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid item id' });
  }

  const reviews = await ItemRating.find({ itemID: itemObjectId })
    .populate('userID', 'fullName') // was 'reviewer' — match your actual User field
    .sort({ createdAt: -1 });
  res.json(reviews);
};






export const getOwnerReviews = async (req: Request, res: Response) => {
  try {
    const ownerID = req.user.id;
    if (!ownerID) return res.status(401).json({ message: 'Unauthorized' });

    const { rating, page = '1', limit = '10' } = req.query;

    const filter: Record<string, unknown> = { ownerID };
    if (rating) filter.rating = Number(rating);

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const [reviews, total] = await Promise.all([
      ItemRating.find(filter)
        .populate({
          path: 'itemID',
          select: 'title', // Item model field is 'title', not 'name'
          populate: { path: 'images' }, // 'images' is a virtual populate on Item -> ItemImage
        })
        .populate('userID', 'fullName profileImage') // User model fields are 'fullName'/'profileImage'
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      ItemRating.countDocuments(filter),
    ]);

    res.status(200).json({
      reviews,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('getOwnerReviews error:', err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  try {

   const reviews=await ItemRating.find()
      .populate({
        path: 'itemID',
        select: 'title', 
         populate: { path: 'images' }, 
      })
      .populate('userID', 'fullName profileImage') 
      
      .sort({ createdAt: -1 })

      res.status(200).json({
        reviews,
       
      });
  } catch (err) {
    console.error('getOwnerReviews error:', err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/rating/owner/summary
// Average rating + 1-5 star distribution for the logged-in owner
// (powers the summary card at the top of Reviews.tsx)
// ---------------------------------------------------------------------------
export const getOwnerReviewSummary = async (req: Request, res: Response) => {
  try {
    const ownerID = req.user.id;
    if (!ownerID) return res.status(401).json({ message: 'Unauthorized' });

    const grouped = await ItemRating.aggregate([
      { $match: { ownerID: new mongoose.Types.ObjectId(ownerID) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const distribution = [5, 4, 3, 2, 1].map((r) => ({
      rating: r,
      count: grouped.find((g) => g._id === r)?.count ?? 0,
    }));

    const totalReviews = distribution.reduce((sum, d) => sum + d.count, 0);
    const avgRating = totalReviews
      ? distribution.reduce((sum, d) => sum + d.rating * d.count, 0) / totalReviews
      : 0;

    res.status(200).json({
      avgRating: Number(avgRating.toFixed(1)),
      totalReviews,
      distribution,
    });
  } catch (err) {
    console.error('getOwnerReviewSummary error:', err);
    res.status(500).json({ message: 'Failed to fetch review summary' });
  }
};
