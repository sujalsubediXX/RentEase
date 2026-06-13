import {Router} from "express";
import { addUser,getUsersByRole } from "../controllers/user.controller.ts";
const router = Router();
router.post("/adduser",addUser);
router.get("/getUser/role=:role",getUsersByRole)
export default router;