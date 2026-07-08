const allowedRoles = ["renter", "owner", "admin"] as const;
type AllowedRole = (typeof allowedRoles)[number];
import { sendEmail } from "../utils/sendEmail.ts";
import crypto from "crypto";

import Rentals from '../models/Rentals.model.ts';
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Users.model.ts";
import Item from '../models/items.model.ts';
import ItemRating from "../models/itemRating.model.ts";

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get user data
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user data as-is
    return res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profileImage: user.profileImage,
      address: user.address,
      status: user.status,
      kycStatus: user.kycStatus,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Error in getMe:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



export const getUserRentals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const rentals = await Rentals.find({ userId })
      .populate('itemId')
      .sort({ createdAt: -1 })
      .lean();

    const rentalIds = rentals.map(r => r._id);
    const reviews = await ItemRating.find({ rentalID: { $in: rentalIds } }).select('rentalID');
    const reviewedSet = new Set(reviews.map(r => r.rentalID.toString()));

    const rentalsWithReviewFlag = rentals.map(r => ({
      ...r,
      hasReview: reviewedSet.has(r._id.toString()),
    }));

    return res.status(200).json({ success: true, data: rentalsWithReviewFlag });
  } catch (error: any) {
    console.error("Error getting user rentals:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to get rentals" });
  }
};
// Change password
// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    // Validate new password with strong password rules
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one uppercase letter"
      });
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one lowercase letter"
      });
    }

    // Check for number
    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one number"
      });
    }

    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one special character"
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error: any) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to change password"
    });
  }
};

// Get user's listings (items they've listed)
export const getUserListings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Import the Items model
  
    
    const listings = await Item.find({ ownerId: userId });

    return res.json({
      success: true,
      listings: listings
    });
  } catch (err) {
    console.error("Error in getUserListings:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password,  allowedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email });
    if (user && user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

   

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    
  if (!allowedRole.includes(user.role)) {
    return res.status(403).json({
      message: "You are not allowed to login from this portal"
    });
  }

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "30d",
    });

    return res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profileImage: user.profileImage,
        address: user.address,
        status: user.status,
        kycStatus: user.kycStatus,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phoneNumber, password, role, address } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: role || "renter",
      address: address || "",
      status: "active",
      kycStatus: "pending",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        address: user.address,
        status: user.status,
        profileImage: user.profileImage,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const roleParam = req.params.role;
    const role = Array.isArray(roleParam) ? roleParam[0] : roleParam;

    if (!role || !allowedRoles.includes(role as AllowedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role parameter. Must be: renter, owner, or admin",
      });
    }

    const users = await User.find({ role: role as AllowedRole });

    const response = users.map((user, index) => ({
      id: `U${String(index + 1).padStart(3, "0")}`,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      address: user.address,
      status: user.status,
      kycStatus: user.kycStatus,
      joined: user.createdAt?.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      avatar:
        user.fullName
          ?.split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase() || "U",
    }));

    res.status(200).json({
      success: true,
      count: users.length,
      users: response,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.user.id;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        address: user.address,
        status: user.status,
        kycStatus: user.kycStatus,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.user.id;
    const { fullName, phoneNumber, address, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        fullName,
        phoneNumber,
        address,
        profileImage,
        updatedAt: new Date(),
      },
      { new: true, returnDocument: "after" },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        address: user.address,
        status: user.status,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const id = req.user.id;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = "inactive";
    await user.save();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};



export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const response = users.map((user, index) => ({
      id: `U${String(index + 1).padStart(3, "0")}`,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      address: user.address,
      status: user.status,
      kycStatus: user.kycStatus,
      joined: user.createdAt?.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      avatar:
        user.fullName
          ?.split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase() || "U",
    }));

    res.status(200).json({
      success: true,
      count: users.length,
      users: response,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};




// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Always respond the same way, whether or not the user exists,
    // so attackers can't use this to check which emails are registered.
    if (!user) {
      return res.status(200).json({
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    // Generate a raw token (sent to user) and a hashed version (stored in DB)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your RentEase password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2>Reset your password</h2>
          <p>We received a request to reset your RentEase password. This link expires in 15 minutes.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#b45309;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;margin:16px 0;">
            Reset Password
          </a>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    // Ensure token is a single string (Express params can be undefined or string[] in typings)
    if (!token || Array.isArray(token)) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires +password");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    // Hash once here — make sure your pre-save hook doesn't double-hash
    // (this bit you already fought with once in RentEase auth)
    user.password = await bcrypt.hash(password, 10);
    // set to null to match schema types (NativeDate | null)
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};