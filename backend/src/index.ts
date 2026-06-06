import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const PORT: number = Number(process.env.PORT) ||  3000;
const app = express();

import userrouter from "./routes/user.route.ts"
import categoryrouter from "./routes/categories.route.ts"

app.use(cors());
app.use(express.json());

app.use("/api",userrouter)
app.use("/api",categoryrouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});