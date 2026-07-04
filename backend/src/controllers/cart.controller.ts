import type { Request, Response } from "express";
import Cart from "../models/Cart.ts";
import ItemImage from "../models/itemsImage.model.ts";
import Item from "../models/items.model.ts";

import {
  getFullyBookedRanges,
  getNextAvailableStartDate,
  rangeOverlapsBlocked,
} from "../utils/availability.ts";

export const addItemToCart = async (req: Request, res: Response) => {
    try {
       const userId = req.user.id;

        const {
            itemId,
            quantity = 1,
            rentalDays = 1,
            startDate,
            endDate,
        } = req.body;

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        // ── Resolve requested dates, defaulting to today ──
        let finalStart = startDate ? new Date(startDate) : new Date();
        finalStart.setHours(0, 0, 0, 0);

        let finalEnd = endDate
            ? new Date(endDate)
            : new Date(finalStart.getTime() + rentalDays * 24 * 60 * 60 * 1000);
        finalEnd.setHours(0, 0, 0, 0);

        // ── Check against fully-booked ranges (interval scheduling) ──
        const blockedRanges = await getFullyBookedRanges(itemId, item.quantity);
        let dateWasAdjusted = false;

        if (rangeOverlapsBlocked(finalStart, finalEnd, blockedRanges)) {
            const durationMs = Math.max(
                finalEnd.getTime() - finalStart.getTime(),
                24 * 60 * 60 * 1000
            );

            finalStart = await getNextAvailableStartDate(itemId, item.quantity, finalStart);
            finalEnd = new Date(finalStart.getTime() + durationMs);
            dateWasAdjusted = true;
        }

        const startDateStr = finalStart.toISOString();
        const endDateStr = finalEnd.toISOString();

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({
                userId,
                items: [],
            });
        }

        const existingItem = cart.items.find(
            (item) => item.itemId.toString() === itemId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.rentalDays = rentalDays;
            existingItem.startDate = startDateStr;
            existingItem.endDate = endDateStr;
        } else {
            cart.items.push({
                itemId,
                quantity,
                rentalDays,
                startDate: startDateStr,
                endDate: endDateStr,
            });
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            message: dateWasAdjusted
                ? `This item wasn't available on your selected date, so we moved it to the next open date: ${finalStart.toDateString()}.`
                : "Item added to cart",
            dateWasAdjusted,
            cart,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to add item to cart",
        });
    }
};


export const getCart = async (req: Request, res: Response) => {
    try {
     const userId = req.user.id;

       
        const cart = await Cart.findOne({ userId }).populate("items.itemId");

        if (!cart) {
            return res.status(200).json({
                success: true,
                cart: { userId, items: [] },
            });
        }

        // Collect all itemIds from the cart
        const itemIds = cart.items
            .map((ci: any) => ci.itemId?._id)
            .filter(Boolean);

        // Fetch all images for those items in one query
        const allImages = await ItemImage.find({ itemId: { $in: itemIds } })
            .sort({ isPrimary: -1, displayOrder: 1 }); // primary image first

        // Group images by itemId for quick lookup
        const imagesByItemId: Record<string, string[]> = {};
        for (const img of allImages) {
            const key = img.itemId.toString();
            if (!imagesByItemId[key]) imagesByItemId[key] = [];
            imagesByItemId[key].push(img.imageUrl);
        }

        // Attach images to each cart item
        const itemsWithImages = cart.items.map((ci: any) => {
            const itemId = ci.itemId?._id?.toString();
            return {
                ...ci.toObject(),
                itemId: {
                    ...ci.itemId.toObject(),
                    images: imagesByItemId[itemId] ?? [],
                },
            };
        });

        return res.status(200).json({
            success: true,
            cart: {
                ...cart.toObject(),
                items: itemsWithImages,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch cart",
        });
    }
};

export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;

            const { quantity, rentalDays, startDate, endDate } = req.body;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const item = cart.items.find(
            (item) => item.itemId.toString() === itemId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart",
            });
        }

        if (quantity !== undefined) item.quantity = quantity;
        if (rentalDays !== undefined) item.rentalDays = rentalDays;
        if (startDate !== undefined) item.startDate = startDate;
        if (endDate !== undefined) item.endDate = endDate;

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart item updated",
            cart,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update cart item",
        });
    }
};

// =========================
// Remove Item From Cart
// =========================
export const removeCartItem = async (req: Request, res: Response) => {
    try {
        const {itemId } = req.params;
        const userId = req.user.id;
     
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        cart.items = cart.items.filter(
            (item) => item._id?.toString() !== itemId
        );

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Item removed from cart",
            cart,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove item",
        });
    }
};

// =========================
// Clear Entire Cart
// =========================
export const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        cart.items = [];

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to clear cart",
        });
    }
};


export const updateCartItemDates = async (req: Request, res: Response) => {
    try {
        const {itemId } = req.params;
        const userId = req.user.id;

        if ( !itemId) {
            return res.status(400).json({
                success: false,
                message: "User ID and Item ID are required",
            });
        }

        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Start date and end date are required",
            });
        }

        // Parse and validate dates early
        const s = new Date(startDate);
        const e = new Date(endDate);

        if (isNaN(s.getTime()) || isNaN(e.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format provided",
            });
        }

        if (e < s) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date",
            });
        }

        // Fetch the cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        // Find the specific item
        const item = cart.items.find(
            (i) => i._id?.toString() === itemId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart",
            });
        }

        // Update properties
        item.startDate = startDate;
        item.endDate = endDate;

        // Calculate rental days safely
        const diffDays = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
        item.rentalDays = Math.max(1, diffDays);

        // Explicitly tell Mongoose that the items array was modified
        cart.markModified('items');

        // Save the parent document
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart item dates updated successfully",
            cart,
        });
    } catch (error) {
        console.error("Error updating cart item dates:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update cart item dates",
        });
    }
};

export const getCartItemCount = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(200).json({
                success: true,
                count: 0,
            });
        }

        return res.status(200).json({
            success: true,
            count: cart.items.length,
        });
    } catch (error) {
        console.error("Get Cart Count Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get cart item count",
        });
    }
};