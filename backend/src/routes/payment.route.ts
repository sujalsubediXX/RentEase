import { Router } from "express";
import { 
  initiatePayment,
  verifyPayment
} from "../controllers/payment.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

const router = Router();

// Public route for eSewa to call back
router.post("/verify", verifyPayment);

// Protected route for initiating payment
router.post("/initiate", authMiddleware, initiatePayment);

export default router;