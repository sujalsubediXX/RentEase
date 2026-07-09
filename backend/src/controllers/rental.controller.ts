import type { Request, Response } from "express";
import Rentals from "../models/Rentals.model.ts";
import Item from "../models/items.model.ts";
import Cart from "../models/Cart.ts";
import { getFullyBookedRanges, checkAvailability } from "../utils/availability.ts";
// ───────────────────────────────────────────────────────────────
// Create Rental / Order
// ───────────────────────────────────────────────────────────────

export const createRental = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const {
      items = [],
      customer,
      paymentMethod,
      subtotal,
      securityDeposit,
      deliveryFee,
      totalAmount,
      type,
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
      paymentMethod: "cod" | "digital";
      subtotal: number;
      securityDeposit: number;
      deliveryFee: number;
      totalAmount: number;
      type: "single" | "cart";
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!items.length) {
      return res.status(400).json({
        success: false,
        message: "No items selected for rental",
      });
    }

    if (
      !customer?.fullName ||
      !customer?.phoneNumber ||
      !customer?.deliveryAddress
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer details are required",
      });
    }

    const rentalItems: any[] = [];
    let calculatedSubtotal = 0;

    // ---------------------------------------------------
    // Validate Items
    // ---------------------------------------------------

for (const item of items) {
      const itemData = await Item.findById(item.id);

      if (!itemData) {
        return res.status(404).json({
          success: false,
          message: `Item ${item.id} not found`,
        });
      }

      // Prevent an owner from renting their own item
      if (itemData.ownerId.toString() === userId.toString()) {
        return res.status(400).json({
          success: false,
          message: `You cannot rent your own item "${itemData.title}"`,
        });
      }

      if (itemData.availability !== "available") {
        return res.status(400).json({
          success: false,
          message: `"${itemData.title}" is not available for rent`,
        });
      }

      // ── Interval-overlap availability check ──
      const { available, availableFrom } = await checkAvailability(
        itemData._id.toString(),
        new Date(item.startDate),
        new Date(item.endDate),
        item.quantity,
        itemData.quantity
      );

      if (!available) {
        return res.status(409).json({
          success: false,
          message: `"${itemData.title}" is fully booked for the selected dates. Next available from ${availableFrom?.toDateString()}.`,
        });
      }

      const itemTotal = itemData.price * item.rentalDays * item.quantity;
      calculatedSubtotal += itemTotal;

      rentalItems.push({
        itemId: itemData._id,
        title: itemData.title,
        price: itemData.price,
        rentalDays: item.rentalDays,
        quantity: item.quantity,
        startDate: item.startDate,
        endDate: item.endDate,
        securityDeposit: itemData.securityDeposit ?? Math.round(itemData.price * 1.5),
      });
    }
    // ---------------------------------------------------
    // Create Rentals
    // ---------------------------------------------------

    const createdRentals = [];

    for (const item of rentalItems) {
      const rental = new Rentals({
        itemId: item.itemId,
        userId,

        startDate: new Date(item.startDate),
        returnDate: new Date(item.endDate),

        totalPrice:
          item.price *
          item.rentalDays *
          item.quantity,

        status:"pending",

        customerDetails: {
          fullName: customer.fullName,
          phoneNumber: customer.phoneNumber,
          deliveryAddress: customer.deliveryAddress,
        },

        paymentMethod,

        rentalDays: item.rentalDays,
        quantity: item.quantity,

        securityDeposit: item.securityDeposit,
      });

      await rental.save();

      createdRentals.push(rental);
    }

    // ---------------------------------------------------
    // Remove rented items from cart
    // ---------------------------------------------------

    if (type === "cart") {
      const cart = await Cart.findOne({ userId });

      if (cart) {
        cart.items = cart.items.filter((cartItem) => {
          return !items.some(
            (selected) =>
              selected.id === cartItem.itemId.toString()
          );
        });

        await cart.save();
      }
    }

    return res.status(201).json({
      success: true,
      message: "Rental created successfully",
      data: {
        rentals: createdRentals,

        subtotal:
          subtotal ?? calculatedSubtotal,

        securityDeposit:
          securityDeposit ?? 0,

        deliveryFee:
          deliveryFee ?? 0,

        totalAmount:
          totalAmount ??
          calculatedSubtotal +
            (securityDeposit ?? 0) +
            (deliveryFee ?? 0),

        rentalIds: createdRentals.map(
          (r: any) => r._id
        ),
      },
    });
  } catch (error: any) {
    console.error("Error creating rental:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create rental",
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

import ItemRating from "../models/itemRating.model.ts";

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
      .sort({ createdAt: -1 })
      .lean();

    // Find which of these rentals already have a review
    const rentalIds = rentals.map(r => r._id);
    const reviews = await ItemRating.find({ rental: { $in: rentalIds } }).select('rental');
    const reviewedSet = new Set(reviews.map(r => r.rentalID.toString()));

    const rentalsWithReviewFlag = rentals.map(r => ({
      ...r,
      hasReview: reviewedSet.has(r._id.toString()),
    }));

    return res.status(200).json({
      success: true,
      data: rentalsWithReviewFlag
    });

  } catch (error: any) {
    console.error("Error getting user rentals:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get rentals"
    });
  }
};


// ─── Approve Rental (Owner approves pending booking) ──────────────────────
export const approveRental = async (req: Request, res: Response) => {
  try {
    const ownerId = (req as any).user?.id;
    const { rentalIds } = req.body;

    if (!ownerId) {
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

    // Find the rentals
    const rentals = await Rentals.find({ _id: { $in: rentalIds } });

    if (rentals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Rentals not found"
      });
    }

    // Verify the owner owns the items
    const itemIds = rentals.map(r => r.itemId);
    const items = await Item.find({ _id: { $in: itemIds }, ownerId: ownerId });
    
    if (items.length !== itemIds.length) {
      return res.status(403).json({
        success: false,
        message: "You don't own one or more of these items"
      });
    }

    // Update rentals to approved
    await Rentals.updateMany(
      { _id: { $in: rentalIds } },
      { status: 'approved' }
    );

    // Update items availability to rented
    await Item.updateMany(
      { _id: { $in: itemIds } },
      { availability: 'rented' }
    );

    return res.status(200).json({
      success: true,
      message: "Booking approved successfully",
      data: {
        confirmedCount: rentals.length
      }
    });

  } catch (error: any) {
    console.error("Error approving rental:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to approve rental"
    });
  }
};

// ─── Start Rental (Owner marks item as picked up, rental begins) ──────────
export const startRental = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ownerId = (req as any).user?.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const rental = await Rentals.findById(id).populate('itemId');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    // Ownership check — only the item's owner can start the rental
    const itemOwnerId = (rental.itemId as any)?.ownerId?.toString?.() || (rental.itemId as any)?.ownerId;
    if (itemOwnerId !== ownerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to start this rental",
      });
    }

    if (rental.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot start a rental with status "${rental.status}". Only approved bookings can be marked as ongoing.`,
      });
    }

    rental.status = 'ongoing' as any;
    await rental.save();

    const updatedRental = await Rentals.findById(rental._id).populate('itemId');

    return res.status(200).json({
      success: true,
      message: "Rental marked as ongoing",
      data: updatedRental,
    });
  } catch (error) {
    console.error("Error starting rental:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      success: false,
      message: "Failed to start rental",
      error: errorMessage,
    });
  }
};

// ─── Get Owner's Rentals ─────────────────────────────────────────────────────

export const getOwnerRentals = async (req: Request, res: Response) => {
  try {
    const ownerId = (req as any).user?.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { status } = req.query;

    // Get all items for this owner
    const ownerItems = await Item.find({ ownerId: ownerId });
    const itemIds = ownerItems.map(item => item._id);

    if (itemIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Get all rentals for these items
    const filter: any = { itemId: { $in: itemIds } };
    if (status && status !== "all") {
      filter.status = status;
    }

    // ✅ ADD THIS: Populate the itemId field
    const rentals = await Rentals.find(filter)
      .populate('itemId') // This fills in the item details
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: rentals
    });

  } catch (error: any) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get owner rentals"
    });
  }
};
export const getByRentalStatus = async (req: Request, res: Response) => {
  try {

    const { status } = req.query;
    const filter: any = {};

    if (status && status !== "all") {
      filter.status = status;
    }
 
 const rentals = await Rentals.find(filter)
  .populate({
    path: "itemId",
    populate: {
      path: "ownerId",
      select: "fullName email",
    },
  });


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

// ─── Cancel / Reject Rental ───────────────────────────────────────────────
export const cancelRental = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { reason, action } = req.body; 

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Find the rental
    const rental = await Rentals.findById(id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found"
      });
    }

    // Check if the user is either the renter or the owner
    const isRenter = rental.userId.toString() === userId;
    const isOwner = await checkIfUserIsOwner(userId, rental.itemId.toString());

    if (!isRenter && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to cancel this booking"
      });
    }

    // Only allow if status is pending or confirmed
    if (rental.status !== 'pending' && rental.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${rental.status}`
      });
    }

    // Determine the new status
    let newStatus = 'cancelled';
    if (action === 'reject' && isOwner) {
      newStatus = 'rejected'; // Owner rejected → goes to rejected tab
    } else if (action === 'cancel' || isRenter) {
      newStatus = 'cancelled'; // Renter cancelled or owner cancelled → goes to cancelled tab
    }

    // Update rental status
    rental.status = newStatus as any;
    if (reason) {
      rental.rejectionReason = reason;
    }
    await rental.save();

    // Make item available again
    await Item.findByIdAndUpdate(
      rental.itemId,
      { availability: 'available' }
    );

    return res.status(200).json({
      success: true,
      message: `Booking ${newStatus} successfully`,
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

// Helper function to check if user owns the item
async function checkIfUserIsOwner(userId: string, itemId: string) {
  const item = await Item.findById(itemId);
  if (!item) return false;
  return item.ownerId.toString() === userId;
}

// ─── Get Item Availability (for date picker) ──────────────────────────────

export const getItemAvailability = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params as { itemId?: string };

    if (!itemId) {
      return res.status(400).json({ success: false, message: "Missing itemId parameter" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const fullyBookedRanges = await getFullyBookedRanges(itemId, item.quantity);

    return res.status(200).json({
      success: true,
      data: {
        itemQuantity: item.quantity,
        fullyBookedRanges: fullyBookedRanges.map((r) => ({
          start: r.start.toISOString(),
          end: r.end.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error("Error getting availability:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get availability",
    });
  }
};

export const completeRental = async (req:Request, res:Response) => {
  try {
    const { id } = req.params;
const ownerId = (req as any).user?.id;

    const rental = await Rentals.findById(id).populate('itemId');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found',
      });
    }
    
    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }


    // Ownership check — only the item's owner can mark it complete
    const itemOwnerId = (rental.itemId as any)?.ownerId?.toString?.() || (rental.itemId as any)?.ownerId;
    if (itemOwnerId !== ownerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this rental',
      });
    }

    if (rental.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Rental is already marked as completed',
      });
    }

    if (!['approved', 'ongoing'].includes(rental.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot complete a rental with status "${rental.status}"`,
      });
    }

    rental.status = 'completed';
    await rental.save();

    // Check whether the item has any OTHER active bookings right now
    // (approved/ongoing, and not yet past their return date).
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overlappingActiveRental = await Rentals.findOne({
      _id: { $ne: rental._id },
      itemId: rental.itemId._id,
      status: { $in: ['approved', 'ongoing'] },
      returnDate: { $gte: today },
    });

    if (!overlappingActiveRental) {
      await Item.findByIdAndUpdate(rental.itemId._id, {
        availability: 'available',
      });
    }
    // else: leave availability as "rented" — another active booking still owns it

    const updatedRental = await Rentals.findById(rental._id).populate('itemId');

    return res.status(200).json({
      success: true,
      message: 'Rental marked as completed',
      data: updatedRental,
    });
  } catch (error) {
    console.error('Error completing rental:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete rental',
      error: errorMessage,
    });
  }
};