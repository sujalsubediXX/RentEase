
const allowedRoles = ["renter", "owner", "admin"] as const;
type AllowedRole = (typeof allowedRoles)[number];

import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Users.model.ts";



export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("-password");

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email });

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

    const JWT_SECRET = process.env.JWT_SECRET ;

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

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
        profileImage:user.profileImage,
        address: user.address,
        isVerified: user.isVerified,
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

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
      role,
      address,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: role || "renter",
      address: address || "",
      isVerified: false,
      kycStatus:
        role === "owner"
          ? "pending"
          : "not_submitted",
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
        isVerified: user.isVerified,
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
      isVerified: user.isVerified,
      kycStatus: user.kycStatus,
      joined: user.createdAt?.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      avatar: user.fullName
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "U",
    }));

    res.status(200).json({
      success: true,
      count: users.length,
      users: response
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
}

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
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
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user"
    });
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, phoneNumber, address, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { 
        fullName, 
        phoneNumber, 
        address, 
        profileImage,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
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
        isVerified: user.isVerified,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user"
    });
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user"
    });
  }
}

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
      isVerified: user.isVerified,
      kycStatus: user.kycStatus,
      joined: user.createdAt?.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      avatar: user.fullName
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "U",
    }));

    res.status(200).json({
      success: true,
      count: users.length,
      users: response
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
}