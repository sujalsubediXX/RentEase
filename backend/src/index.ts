import express from "express";
import type{ Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
const PORT: number = Number(process.env.PORT) ||  3000;
const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("TypeScript Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});