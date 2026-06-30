import type { Request, Response } from "express";
import mongoose from "mongoose";
import Rentals from "../models/Rentels.model.ts";
import Item from "../models/items.model.ts";
import Cart from "../models/Cart.ts";

// ─── Create Rental / Order ──────────────────────────────────────────────────

export const createRental = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = (req as any).user?.id;
    
    // ── Destructure with proper types ──
    const {
      items = [],
      customer,
      paymentMethod,
      subtotal,
      securityDeposit,
      deliveryFee,
      totalAmount,
      type
    }: {
      items: Array<{
        id: string;
        startDate: string;
        endDate: string;
        rentalDays: number;
        quantity: number;
      }>;
      customer: {
        fullName: string;
        phoneNumber: string;
        deliveryAddress: string;
      };
      paymentMethod: 'cod' | 'digital';
      subtotal: number;
      securityDeposit: number;
      deliveryFee: number;
      totalAmount: number;
      type: 'single' | 'cart';
    } = req.body;

    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // ── Validate required fields ──
    if (!items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "No items to rent"
      });
    }

    if (!customer?.fullName || !customer?.phoneNumber || !customer?.deliveryAddress) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Customer details are required"
      });
    }

    // ── Validate each item exists and is available ──
    const rentalItems: any[] = [];
    let totalPrice = 0;

    for (const item of items) {
      const itemData = await Item.findById(item.id as string).session(session);
      
      if (!itemData) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: `Item ${item.id} not found`
        });
      }

      if (itemData.availability !== "available") {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Item "${itemData.title}" is not available for rent`
        });
      }

      // Calculate item total
      const itemTotal = itemData.price * item.rentalDays * item.quantity;
      totalPrice += itemTotal;

      rentalItems.push({
        itemId: itemData._id,
        title: itemData.title,
        price: itemData.price,
        rentalDays: item.rentalDays,
        quantity: item.quantity,
        startDate: item.startDate,
        endDate: item.endDate,
        securityDeposit: itemData.securityDeposit || Math.round(itemData.price * 1.5)
      });
    }

    // ── Create rental records ──
    const createdRentals: any[] = [];
    for (const item of rentalItems) {
      const rental = new Rentals({
        itemId: item.itemId,
        userId: userId,
        startDate: new Date(item.startDate),
        returnDate: new Date(item.endDate),
        totalPrice: item.price * item.rentalDays * item.quantity,
        status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
        customerDetails: {
          fullName: customer.fullName,
          phoneNumber: customer.phoneNumber,
          deliveryAddress: customer.deliveryAddress
        },
        paymentMethod: paymentMethod,
        rentalDays: item.rentalDays,
        quantity: item.quantity,
        securityDeposit: item.securityDeposit
      });

      await rental.save({ session });
      createdRentals.push(rental);
    }

    // ── Remove items from cart if type is 'cart' ──
    if (type === 'cart') {
      const cart = await Cart.findOne({ userId }).session(session);
      if (cart) {
        // ✅ FIX: Properly typed item IDs
        const itemIds = items.map((item) => new mongoose.Types.ObjectId(item.id as string));
        cart.items = cart.items.filter(
          (cartItem) => !itemIds.some((id) => id.equals(cartItem.itemId))
        );
        await cart.save({ session });
      }
    }

    // ── Commit transaction ──
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Rental created successfully",
      data: {
        rentals: createdRentals,
        totalAmount: totalAmount || totalPrice + (securityDeposit || 0) + (deliveryFee || 0),
        subtotal: totalPrice,
        securityDeposit: securityDeposit || 0,
        deliveryFee: deliveryFee || 0,
        rentalIds: createdRentals.map((r: any) => r._id)
      }
    });

  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating rental:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create rental"
    });
  }
};

// ─── Get Checkout Summary ──────────────────────────────────────────────────

export const getCheckoutSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { itemId, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // ── Single item checkout ──
    if (itemId) {
      const item = await Item.findById(itemId).populate('images');
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Item not found"
        });
      }

      if (item.availability !== "available") {
        return res.status(400).json({
          success: false,
          message: "Item is not available for rent"
        });
      }

      // Fix: Handle images properly
      const itemImages = (item as any).images || [];

      const rentalDays = startDate && endDate 
        ? Math.max(1, Math.ceil((new Date(endDate as string).getTime() - new Date(startDate as string).getTime()) / (1000 * 60 * 60 * 24)))
        : 1;

      const subtotal = item.price * rentalDays;
      const securityDeposit = item.securityDeposit || Math.round(item.price * 1.5);
      const deliveryFee = 150;

      return res.status(200).json({
        success: true,
        data: {
          type: 'single',
          item: {
            id: item._id,
            title: item.title,
            price: item.price,
            images: itemImages,
            location: item.location,
            securityDeposit: securityDeposit
          },
          rentalDays,
          subtotal,
          securityDeposit,
          deliveryFee,
          totalAmount: subtotal + securityDeposit + deliveryFee
        }
      });
    }

    // ── Cart checkout ──
    const cart = await Cart.findOne({ userId }).populate('items.itemId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    let subtotal = 0;
    let totalSecurityDeposit = 0;
    const cartItems = [];

    for (const cartItem of cart.items) {
      const item = cartItem.itemId as any;
      if (!item) continue;

      const itemTotal = item.price * cartItem.rentalDays * cartItem.quantity;
      subtotal += itemTotal;
      const securityDeposit = item.securityDeposit || Math.round(item.price * 1.5);
      totalSecurityDeposit += securityDeposit * cartItem.quantity;

      // Fix: Handle images properly
      const itemImages = item.images || [];

      cartItems.push({
        id: item._id,
        title: item.title,
        price: item.price,
        quantity: cartItem.quantity,
        rentalDays: cartItem.rentalDays,
        startDate: cartItem.startDate,
        endDate: cartItem.endDate,
        images: itemImages,
        securityDeposit: securityDeposit
      });
    }

    const deliveryFee = 150;

    return res.status(200).json({
      success: true,
      data: {
        type: 'cart',
        items: cartItems,
        subtotal,
        securityDeposit: totalSecurityDeposit,
        deliveryFee,
        totalAmount: subtotal + totalSecurityDeposit + deliveryFee
      }
    });

  } catch (error: any) {
    console.error("Error getting checkout summary:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get checkout summary"
    });
  }
};

// ─── Confirm Rental (after successful payment) ───────────────────────────

export const confirmRental = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { rentalIds, paymentDetails } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!rentalIds || rentalIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No rental IDs provided"
      });
    }

    // Update rentals to confirmed
    const updateResult = await Rentals.updateMany(
      { _id: { $in: rentalIds }, userId: userId },
      { 
        status: 'confirmed',
        paymentDetails: paymentDetails || {}
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Rentals not found or already confirmed"
      });
    }

    // Update items availability to rented
    const rentals = await Rentals.find({ _id: { $in: rentalIds } });
    for (const rental of rentals) {
      await Item.findByIdAndUpdate(
        rental.itemId,
        { availability: 'rented' }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Rental confirmed successfully",
      data: {
        confirmedCount: updateResult.modifiedCount
      }
    });

  } catch (error: any) {
    console.error("Error confirming rental:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to confirm rental"
    });
  }
};

// ─── Get User Rentals ─────────────────────────────────────────────────────

export const getUserRentals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const rentals = await Rentals.find({ userId })
      .populate('itemId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: rentals
    });

  } catch (error: any) {
    console.error("Error getting user rentals:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get rentals"
    });
  }
};

// ─── Get Rental by ID ─────────────────────────────────────────────────────

export const getRentalById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const rental = await Rentals.findOne({ _id: id, userId })
      .populate('itemId');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: rental
    });

  } catch (error: any) {
    console.error("Error getting rental:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get rental"
    });
  }
};

// ─── Cancel Rental ────────────────────────────────────────────────────────

export const cancelRental = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const rental = await Rentals.findOne({ _id: id, userId });

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found"
      });
    }

    // Only allow cancellation if status is pending or confirmed
    if (rental.status !== 'pending' && rental.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel rental at this stage"
      });
    }

    rental.status = 'cancelled';
    await rental.save();

    // Make item available again
    await Item.findByIdAndUpdate(
      rental.itemId,
      { availability: 'available' }
    );

    return res.status(200).json({
      success: true,
      message: "Rental cancelled successfully",
      data: rental
    });

  } catch (error: any) {
    console.error("Error cancelling rental:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel rental"
    });
  }
};