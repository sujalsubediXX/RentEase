import {Router} from "express";
import { itemData } from "../controllers/user.controller.ts";
const router = Router();
router.get("/items",itemData)
export default router;