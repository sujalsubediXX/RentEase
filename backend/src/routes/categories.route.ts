import {Router} from "express";
import {addCategory,fetchCategory,updateCategory,deleteCategory} from "../controllers/categories.controller.ts"
import {upload} from "../config/upload.ts"

const router = Router();
router.get("/getcategory", fetchCategory);
router.post("/addcategory", upload.single("image"), addCategory);
router.put("/updatecategory/:id", upload.single("image"), updateCategory);
router.delete("/deletecategory/:id", deleteCategory);
export default router;