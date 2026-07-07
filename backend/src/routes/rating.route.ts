import { Router } from "express";
import {
  createReview,
  getItemReviews,
  getOwnerReviews,
  getAllReviews,
  getOwnerReviewSummary
} from "../controllers/rating.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

const router = Router();
router.get('/owner/summary', authMiddleware, getOwnerReviewSummary);  
router.get('/owner', authMiddleware, getOwnerReviews);

// General routes
router.get('/allReviews', authMiddleware, getAllReviews);

// Create review
router.post('/reviews', authMiddleware, createReview);

router.get('/reviews/item/:itemId', getItemReviews);

export default router;