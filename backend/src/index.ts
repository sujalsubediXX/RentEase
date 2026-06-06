import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import userrouter from "./routes/user.route.ts"

const PORT: number = Number(process.env.PORT) ||  3000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api",userrouter)


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});