import { Router } from "express";
import { 
  createRental,
  getCheckoutSummary,
  confirmRental,
  getUserRentals,
  getRentalById,
  cancelRental
} from "../controllers/rental.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

const router = Router();

// All rental routes require authentication
router.use(authMiddleware);

// Get checkout summary (supports single item or cart)
router.get("/checkout-summary", getCheckoutSummary);

// Create rental/order
router.post("/create", createRental);

// Confirm rental (after successful payment)
router.put("/confirm", confirmRental);

// Get user's rentals
router.get("/my-rentals", getUserRentals);

// Get rental by ID
router.get("/:id", getRentalById);

// Cancel rental
router.put("/:id/cancel", cancelRental);

export default router;