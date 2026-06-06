
import type { Request, Response } from "express";
import Category from "../models/category.model.ts";

export const addCategory = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    try {
        console.log("Received category data:", { name, description });
        const category = new Category({ name, description });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: "Error creating category", error });
    }
}

export const fetchCategory = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    try {
        console.log("Received category data:", { name, description });
        const category = new Category({ name, description });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: "Error fetching category", error });
    }
}
export const updateCategory = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    try {
        console.log("Received category data:", { name, description });
        const category = new Category({ name, description });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: "Error updating category", error });
    }
}
export const deleteCategory = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    try {
        console.log("Received category data:", { name, description });
        const category = new Category({ name, description });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: "Error deleting category", error });
    }
}


