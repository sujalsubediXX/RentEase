import { Router } from "express";
import { 
  loginUser, 
  register,
  getUsersByRole, 
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  getMe
} from "../controllers/user.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
const router = Router();


router.get("/me", authMiddleware, getMe);
router.post("/register", register);
router.post("/login",loginUser);
// Get all users
router.get("/users", getAllUsers);

// Get users by role
router.get("/users/role/:role", getUsersByRole);

// Get single user
router.get("/users/:id", getUserById);

// Create user

// Update user
router.put("/users/:id", updateUser);

// Delete user
router.delete("/users/:id", deleteUser);

export default router;