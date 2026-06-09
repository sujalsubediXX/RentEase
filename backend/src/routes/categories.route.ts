import {Router} from "express";
import {addCategory,fetchCategory,updateCategory,deleteCategory} from "../controllers/categories.controller.ts"
import {uploadCategory} from "../config/upload.ts"

const router = Router();
router.get("/getcategory", fetchCategory);
router.post("/addcategory", uploadCategory.single("image"), addCategory);
router.put("/updatecategory/:id", uploadCategory.single("image"), updateCategory);
router.delete("/deletecategory/:id", deleteCategory);
export default router;