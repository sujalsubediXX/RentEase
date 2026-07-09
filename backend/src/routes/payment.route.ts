import { Router } from "express";
import { 
  initiatePayment,
  verifyPayment
} from "../controllers/payment.controller.ts";
import Payments from "../models/Payments.model.ts";

import { authMiddleware } from "../middleware/auth.middleware.ts";

const router = Router();
router.get("/getpayments", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only."
      });
    }

    const payments = await Payments.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payments"
    });
  }
});

router.post("/esewa/initiate-payment", authMiddleware, initiatePayment);
router.post("/esewa/verify-payment", verifyPayment);


export default router;