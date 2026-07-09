import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/dbconnection.ts"
const app = express();

import adminRoutes from "./routes/admin.route.ts";
import userrouter from "./routes/user.route.ts"
import categoryrouter from "./routes/categories.route.ts"
import itemrouter from "./routes/items.route.ts"
import paymentroute from "./routes/payment.route.ts"
import cartroute from "./routes/cart.route.ts"
import rentalrouter from "./routes/rental.route.ts"; 
import kycRoutes from "./routes/kycverification.route.ts";
import ratingRouter from "./routes/rating.route.ts"
import path from "path";
import wishlistroute from "./routes/wishlist.route.ts"
const PORT: number = Number(process.env.PORT) ;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

connectDB().then(() => {
  console.log("Database connected successfully");
}).catch(({ err }: { err: any }) => {
  console.error("Database connection error:", err);
  process.exit(1);
});
app.use("/api/rating", ratingRouter);
app.use("/api/user", userrouter)
app.use("/api/category", categoryrouter)
app.use("/api/items", itemrouter)
app.use("/api/payment", paymentroute)
app.use("/api/cart", cartroute)
app.use("/api/wishlist", wishlistroute)
app.use("/api/rentals", rentalrouter);
app.use("/api/kyc", kycRoutes);
app.use("/api/admin", adminRoutes);



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
 });