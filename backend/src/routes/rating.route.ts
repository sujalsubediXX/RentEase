import { Router } from "express";
import {createReview,getItemReviews,getOwnerReviews,getAllReviews,getOwnerReviewSummary} from "../controllers/rating.controller.ts"
import { authMiddleware } from "../middleware/auth.middleware.ts";
const router = Router();
router.post('/reviews', authMiddleware, createReview);
router.get('/reviews/item/:itemId', getItemReviews);

router.get('/owner', authMiddleware, getOwnerReviews);
router.get('/allReviews', authMiddleware, getAllReviews);
router.get('/owner/summary', authMiddleware, getOwnerReviewSummary);
export default router;