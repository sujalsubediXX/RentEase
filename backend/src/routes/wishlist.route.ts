import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controllers/wishlist.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
const router = express.Router();

router.post("/add/", authMiddleware, addToWishlist);
router.delete("/remove/:itemId", authMiddleware, removeFromWishlist);
router.get("/wishitem", authMiddleware, getWishlist);

export default router;