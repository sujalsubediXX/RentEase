import {createItem, getItems, getItemsByCategoryId, getItemsByOwnerId } from "../controllers/items.controller.ts";
import {Router} from "express";
const router = Router();
import {uploadItem} from "../config/upload.ts"
router.post(
  "/additems",
  uploadItem.array("images", 10), 
  createItem
);
router.get("/getitems", getItems);
router.get("/getitemsbycategory/:categoryId", getItemsByCategoryId);
router.get("/getitemsbyownerId/:ownerId", getItemsByOwnerId);
export default router;