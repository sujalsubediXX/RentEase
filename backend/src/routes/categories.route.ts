import {Router} from "express";
import {addCategory} from "../controllers/categories.controller.ts";
const router = Router();
router.post("/addcategory",addCategory)
export default router;