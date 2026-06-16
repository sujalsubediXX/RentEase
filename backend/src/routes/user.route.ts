import { Router } from "express";
import { 
  addUser, 
  getUsersByRole, 
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers
} from "../controllers/user.controller.ts";

const router = Router();

// Get all users
router.get("/users", getAllUsers);

// Get users by role
router.get("/users/role/:role", getUsersByRole);

// Get single user
router.get("/users/:id", getUserById);

// Create user
router.post("/users", addUser);

// Update user
router.put("/users/:id", updateUser);

// Delete user
router.delete("/users/:id", deleteUser);

export default router;