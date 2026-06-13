import type { Request, Response } from "express";
import User from "../models/Users.model.ts";

const allowedRoles = ["user", "owner", "admin"] as const;
type AllowedRole = (typeof allowedRoles)[number];

export const addUser=async (req: Request, res: Response) => {
  try {
    console.log("hi")
    const { fullname, email, phone, password, role } = req.body;

    const user = await User.create({
      fullname,
      email,
      phone,
      password,
      role: role || "user",
      status:"active"
    });

    res.status(201).json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message });
  }
}


export const getUsersByRole = async (req: Request, res: Response)=> {
    try {
        const roleParam = req.params.role;
        const role = Array.isArray(roleParam) ? roleParam[0] : roleParam;

        if (!role || !allowedRoles.includes(role as AllowedRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role parameter",
            });
        }

        const users = await User.find({ role: role as AllowedRole });

        const response = users.map((user, index) => ({
            id: `U${String(index + 1).padStart(3, "0")}`,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            status: user.status,
            joined: user.createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            avatar: user.fullname
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase(),
        }));

        res.status(200).json(response);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
};


