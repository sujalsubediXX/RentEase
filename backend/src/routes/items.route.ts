import {createItem, fetchFeaturedItems, getItems, getItemsByCategoryId, getItemsByOwnerId, recommendedItemsHandler ,fetchMostRentedItems,updateAvailability,deleteItem,getItemsforAdmin} from "../controllers/items.controller.ts";
import {Router} from "express";
const router = Router();
import {uploadItem} from "../config/upload.ts"
import Item from "../models/items.model.ts";

import { authMiddleware } from "../middleware/auth.middleware.ts";
router.post(
  "/additems",
  uploadItem.array("images", 10), 
  createItem
);
router.get("/getitems", getItems);
router.get("/getitemsforadmin",authMiddleware, getItemsforAdmin);
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

router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only."
      });
    }

    const { id } = req.params;
    const { action } = req.body;

    let updateData: any = {};
    
    switch(action) {
      case 'approve':
        updateData = { isApproved: true, isActive: true };
        break;
      case 'remove':
        updateData = { isActive: false, availability: 'unavailable' };
        break;
      case 'flag':
        updateData = { isActive: false, availability: 'unavailable' };
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action"
        });
    }

    const item = await Item.findByIdAndUpdate(id, updateData, { new: true });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: `Item ${action}ed successfully`,
      data: item
    });
  } catch (error: any) {
    console.error("Error updating item status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update item"
    });
  }
});


export default router;