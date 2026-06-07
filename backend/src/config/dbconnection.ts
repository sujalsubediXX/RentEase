import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Rent_Ease";
export const connectDB = async () => {


  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined in .env file");
  }

  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected:", conn.connection.host);
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
};