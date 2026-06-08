import {createItem, getItems} from "../controllers/items.controller.ts";
import express from "express";
const router = express.Router();
import {uploadItem} from "../config/upload.ts"
router.post(
  "/additems",
  uploadItem.array("images", 10), 
  createItem
);
router.get("/getitems", getItems);
export default router;