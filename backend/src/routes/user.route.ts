import { Router } from "express";
import { 
  loginUser, 
  register,
  getUsersByRole, 
  getUserById,
  updateUser,
  deactivateUser,
  getAllUsers,
  getMe,
  getUserRentals,    
  getUserListings,   

  changePassword,
} from "../controllers/user.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
const router = Router();
router.get("/me", authMiddleware, getMe);

router.get("/rentals", authMiddleware, getUserRentals);    
router.get("/listings", authMiddleware, getUserListings);  

router.post("/register", register);
router.post("/login",loginUser);
// Get all users
router.get("/users", getAllUsers);
router.post("/change-password", authMiddleware, changePassword);  

// Get users by role
router.get("/role/:role", getUsersByRole);

// Get single user
router.get("/users/:id", getUserById);

// Create user

// Update user
router.put("/users/:id", updateUser);

// Deactivate user
router.patch("/:id/deactivate", deactivateUser);

export default router;