import type { Request, Response } from "express";
import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.ts";



// export const getWishlist = async (req: Request, res: Response) => {
//     try {
//         const { userId } = req.params;
//         if (!userId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "User ID is required",
//             });
//         }
//         const wishlist = await Wishlist.findOne({ userId }).populate(
//             "items"
//         );

//         if (!wishlist) {
//             return res.status(200).json({
//                 success: true,
//                 items: [],
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             items: wishlist.items,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Server error",
//         });
//     }
// };
// export const addToWishlist = async (req: Request, res: Response) => {
//     try {
//         const userId = req.params.userId as string;
//         const { itemId } = req.body;

//         if (!userId || !itemId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "userId and itemId required",
//             });
//         }

//         if (
//             !mongoose.Types.ObjectId.isValid(userId) ||
//             !mongoose.Types.ObjectId.isValid(itemId)
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid IDs",
//             });
//         }

//         const wishlist = await Wishlist.findOneAndUpdate(
//             { userId },
//             {
//                 $addToSet: { items: itemId }, // prevents duplicates
//             },
//             {
//                 returnDocument:"after",
//                 upsert: true,
//             }
//         ).populate("items");

//         return res.status(200).json({
//             success: true,
//             message: "Item added to wishlist",
//             wishlist,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Server error",
//         });
//     }
// };


// export const removeFromWishlist = async (req: Request, res: Response) => {
//     try {
//         const { userId, itemId } = req.params;

//         if (!userId || !itemId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "userId and itemId required",
//             });
//         }

//         const wishlist = await Wishlist.findOneAndUpdate(
//             { userId },
//             {
//                 $pull: { items: itemId },
//             },
//             { new: true }
//         ).populate("items");

//         if (!wishlist) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Wishlist not found",
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Item removed from wishlist",
//             wishlist,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Server error",
//         });
//     }
// };


// const Wishlist = require("../models/Wishlist");

// ── GET /api/wishlist ─────────────────────────────────────────────────────────
// Returns the current user's wishlist
export const getWishlist = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        console.log(userId)
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }
        const wishlist = await Wishlist.findOne({ userId }).populate({
            path: "items",
            select: "title description price quantity availability",
            populate: {
                path: "images",
                select: "imageUrl isPrimary"
            }
        });

        if (!wishlist) {
            // Return empty wishlist if none exists yet
            return res.status(200).json({ items: [] });
        }

        res.status(200).json(wishlist);
    } catch (err) {
        console.error("getWishlist error:", err);
        res.status(500).json({ message: "Failed to fetch wishlist" });
    }
};

// ── POST /api/wishlist ────────────────────────────────────────────────────────
// Add an item to wishlist (idempotent — won't duplicate)
export const addToWishlist = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        const { itemId } = req.body;

        if (!userId || !itemId) {
            return res.status(400).json({
                success: false,
                message: "userId and itemId required",
            });
        }

        if (!itemId) {
            return res.status(400).json({ message: "itemId is required" });
        }

        const wishlist = await Wishlist.findOneAndUpdate(
            { userId },
            { $addToSet: { items: itemId } }, // $addToSet prevents duplicates
            { returnDocument: "after", upsert: true }        // create if doesn't exist
        );

        res.status(200).json({ message: "Added to wishlist", wishlist });
    } catch (err) {
        console.error("addToWishlist error:", err);
        res.status(500).json({ message: "Failed to add to wishlist" });
    }
};

// ── DELETE /api/wishlist/:itemId ──────────────────────────────────────────────
// Remove an item from wishlist (idempotent — no error if not present)
export const removeFromWishlist = async (req: Request, res: Response) => {
    try {
        const { userId, itemId } = req.params;
        if (!userId || !itemId) {
            return res.status(400).json({
                success: false,
                message: "userId and itemId required",
            });
        }
        const wishlist = await Wishlist.findOneAndUpdate(
            { userId },
            { $pull: { items: itemId } }, // $pull removes safely even if not present
            { returnDocument: "after" }
        );

        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" });
        }

        res.status(200).json({ message: "Removed from wishlist", wishlist });
    } catch (err) {
        console.error("removeFromWishlist error:", err);
        res.status(500).json({ message: "Failed to remove from wishlist" });
    }
};
