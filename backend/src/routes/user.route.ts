import { Router } from "express";
import { 
  loginUser, 
  register,
  getUsersByRole, 
  getUserById,
  updateUser,
  deactivateUser,
  getUserDetailsByAdmin,
  toggleUserStatusByAdmin,
  getAllUsers,
  getMe,
  getUserRentals,    
  getUserListings,   

  changePassword,
  forgotPassword,
  resetPassword
} from "../controllers/user.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import { isAdmin } from "../middleware/auth.middleware.ts";
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
router.get("/users", authMiddleware, getUserById);

// Create user

// Update user
router.put("/users", authMiddleware, updateUser);

// Deactivate user
router.patch("/deactivate", authMiddleware, deactivateUser);
router.get("/admin/users/:id", authMiddleware, isAdmin, getUserDetailsByAdmin);
router.patch("/admin/users/:id/status", authMiddleware, isAdmin, toggleUserStatusByAdmin);
// routes/authRoutes.ts



router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;