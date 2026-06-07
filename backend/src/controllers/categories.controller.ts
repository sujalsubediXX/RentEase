import type { Request, Response } from "express";
import Category from "../models/category.model.ts";




export const addCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    const category = new Category({
      name,
      description,
      image: req.file?.filename || "",
    });

    const saved = await category.save();

    return res.status(201).json(saved);
  } catch (error: any) {
    return res.status(400).json({
      message: "Error creating category",
      error: error.message,
    });
  }
};


export const fetchCategory = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find();

        return res.status(200).json(categories);
    } catch (error: any) {
        return res.status(500).json({
            message: "Error fetching categories",
            error: error.message,
        });
    }
};


export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, description },
             { returnDocument: "after" }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.status(200).json(updatedCategory);
    } catch (error: any) {
        return res.status(400).json({
            message: "Error updating category",
            error: error.message,
        });
    }
};


export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.status(200).json({
            message: "Category deleted successfully",
        });
    } catch (error: any) {
        return res.status(400).json({
            message: "Error deleting category",
            error: error.message,
        });
    }
};