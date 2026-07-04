import {addItemToCart,getCart,updateCartItem,removeCartItem,clearCart,updateCartItemDates,getCartItemCount} from "../controllers/cart.controller.ts"
import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.ts";


const router = express.Router();

// router.use(authMiddleware);
router.post("/add",authMiddleware, addItemToCart);

router.get("/getcart",authMiddleware, getCart);

router.put("/update/:itemId", authMiddleware, updateCartItem);

router.delete("/remove/:itemId", authMiddleware, removeCartItem);

router.delete("/clear", authMiddleware, clearCart);
router.put("/update-dates/:itemId", authMiddleware, updateCartItemDates);

router.get('/count',authMiddleware, getCartItemCount);
export default router;