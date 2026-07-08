import { Router } from "express";
import { 
  initiatePayment,
  verifyPayment
} from "../controllers/payment.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

const router = Router();

router.post("/initiate-payment", authMiddleware, initiatePayment);
router.post("/verify-payment", verifyPayment);


export default router;