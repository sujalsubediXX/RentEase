import { Router } from "express";
import { 
  createRental,
  getCheckoutSummary,
  confirmRental,
  getUserRentals,
  getRentalById,
  cancelRental,
  getItemAvailability,
  getByRentalStatus
} from "../controllers/rental.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

const router = Router();



// Get checkout summary (supports single item or cart)
router.get("/checkout-summary", authMiddleware, getCheckoutSummary);
router.get("/filterStatus", authMiddleware, getByRentalStatus);

// Create rental/order
router.post("/create", authMiddleware, createRental);

// Confirm rental (after successful payment)
router.put("/confirm", authMiddleware, confirmRental);

// Get user's rentals
router.get("/my-rentals", authMiddleware, getUserRentals);

// Get rental by ID
router.get("/:id", authMiddleware, getRentalById);

// Cancel rental
router.put("/:id/cancel", authMiddleware, cancelRental);

router.get("/availability/:itemId", authMiddleware, getItemAvailability);
export default router;