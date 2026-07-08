import {createItem, fetchFeaturedItems, getItems, getItemsByCategoryId, getItemsByOwnerId, recommendedItemsHandler ,fetchMostRentedItems,updateAvailability,deleteItem} from "../controllers/items.controller.ts";
import {Router} from "express";
const router = Router();
import {uploadItem} from "../config/upload.ts"
import { authMiddleware } from "../middleware/auth.middleware.ts";
router.post(
  "/additems",
  uploadItem.array("images", 10), 
  createItem
);
router.get("/getitems", getItems);
router.get("/getitemsbycategory/:categoryId", getItemsByCategoryId);
router.get("/getitemsbyownerId/:ownerId", getItemsByOwnerId);
router.get("/fetch-featured-items", fetchFeaturedItems);
router.get("/fetch-user-recommended-items", authMiddleware, recommendedItemsHandler);
router.get("/fetch-most-rented-items", fetchMostRentedItems);
router.put(
    "/update-availability/:id",authMiddleware,
    updateAvailability
);
router.delete("/:id", authMiddleware, deleteItem);


export default router;