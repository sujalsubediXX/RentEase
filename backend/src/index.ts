import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import {connectDB} from "./config/dbconnection.ts"
const app = express();

import userrouter from "./routes/user.route.ts"
import categoryrouter from "./routes/categories.route.ts"
import itemrouter from "./routes/items.route.ts"
import checkoutroute from "./routes/checkout.route.ts"
import path from "path";
const PORT: number = Number(process.env.PORT) || 3000;


import User from "./models/Users.model.ts";
import type { Request, Response } from "express";


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

connectDB().then(() => {
  console.log("Database connected successfully");
}).catch(({err}: {err: any}) => {
  console.error("Database connection error:", err);
  process.exit(1);
});
app.use("/api/user", userrouter)
app.use("/api/category", categoryrouter)
app.use("/api/items", itemrouter)
app.use("/api/payment", checkoutroute)


app.post("/adduser",  async (req: Request, res: Response) => {
  try {
    const { fullname, email, phone, password, role } = req.body;

    const user = await User.create({
      fullname,
      email,
      phone,
      password,
      role: role || "user"
    });

    res.status(201).json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message });
  }
})
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});