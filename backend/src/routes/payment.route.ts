import { Router } from "express";
import { 
  initiatePayment,
  verifyPayment
} from "../controllers/payment.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

const router = Router();

router.post("/esewa/initiate-payment", authMiddleware, initiatePayment);
router.post("/esewa/verify-payment", verifyPayment);


export default router;