import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controllers/wishlist.controller.ts";

const router = express.Router();

router.post("/add/:userId", addToWishlist);
router.delete("/remove/:userId/:itemId", removeFromWishlist);
router.get("/:userId", getWishlist);

export default router;