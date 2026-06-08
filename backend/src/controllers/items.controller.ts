import type { Request, Response } from "express";
import ItemImage from "../models/itemsImage.model.ts";
import Item from "../models/items.model.ts";
export const createItem = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      location,
      price,
      categoryId,
      ownerId,
      condition
    } = req.body;

    // 1. Create item
    const item = await Item.create({
      title,
      description,
      location,
      price,
      categoryId,
      ownerId,
      condition
    });

    // 2. Handle uploaded images
    const files = Array.isArray(req.files) ? req.files : [];

    if (files.length > 0) {
      const images = files.map((file, index) => ({
        itemId: item._id,
        imageUrl: `/uploads/items/${file.filename}`, 
        isPrimary: index === 0,
        displayOrder: index
      }));

      await ItemImage.insertMany(images);
    }

    res.status(201).json({
      message: "Item created successfully",
      itemId: item._id
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message });
  }
};





export const getItems = async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.categoryId as string;
    const search = (req.query.search as string) || "";

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const query: any = {};

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const items = await Item.find(query)
      .skip(skip)
      .limit(limit)
      .lean();

    const itemIds = items.map((i) => i._id);

    const images = await ItemImage.find({
      itemId: { $in: itemIds }
    }).lean();

    const result = items.map((item: any) => ({
      ...item,
      images: images
        .filter((img) => img.itemId.toString() === item._id.toString())
        .map((img) => img.imageUrl)
    }));

    const total = await Item.countDocuments(query);

    res.json({
      items: result,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};