import {Router} from "express";
import {addCategory,fetchCategory,updateCategory,deleteCategory} from "../controllers/categories.controller.ts"

const router = Router();
router.get("/getcategory", fetchCategory);
router.post("/addcategory", addCategory);
router.put("/addcategory", updateCategory);
router.delete("/addcategory", deleteCategory);
export default router;