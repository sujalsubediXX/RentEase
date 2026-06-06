
import type { Request, Response } from "express";
import Category from "../models/Categories.model.ts";

export const addCategory = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    try {
        const category = new Category({ name, description });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: "Error creating category", error });
    }
}