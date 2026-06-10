import { initiatePayment,verifyPayment } from "../controllers/checkout.controller.ts";
import express from "express";
const router = express.Router();


router.post("/esewa/verify-payment", verifyPayment);
router.post("/esewa/initiate", initiatePayment);
export default router;