import {Router} from "express";
import { getUsersByRole } from "../controllers/user.controller.ts";
const router = Router();
router.get("/getUser/role=:role",getUsersByRole)
export default router;