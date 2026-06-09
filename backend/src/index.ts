import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import {connectDB} from "./config/dbconnection.ts"
const app = express();

import userrouter from "./routes/user.route.ts"
import categoryrouter from "./routes/categories.route.ts"
import itemrouter from "./routes/items.route.ts"
import path from "path";
const PORT: number = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
// Debug middleware - logs all requests
connectDB().then(() => {
  console.log("Database connected successfully");
}).catch(({err}: {err: any}) => {
  console.error("Database connection error:", err);
  process.exit(1);
});
app.use("/api", userrouter)
app.use("/api/category", categoryrouter)
app.use("/api/items", itemrouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});