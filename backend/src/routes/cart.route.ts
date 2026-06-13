import {addItemToCart,getCart,updateCartItem,removeCartItem,clearCart,updateCartItemDates} from "../controllers/cart.controller.ts"
import express from "express";


const router = express.Router();

router.post("/add/:userId", addItemToCart);

router.get("/:userId", getCart);

router.put("/update/:userId/:itemId", updateCartItem);

router.delete("/remove/:userId/:itemId", removeCartItem);

router.delete("/clear/:userId", clearCart);
router.put("/update-dates/:userId/:itemId", updateCartItemDates);
export default router;