import mongoose from "mongoose";
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

    // 1. Find items under category
    const items = await Item.find()
      .sort({ createdAt: -1 })
      .lean();

    const itemIds = items.map((item) => item._id);

    // 2. Fetch images for all items
    const images = await ItemImage.find({ itemId: { $in: itemIds } })
      .sort({ displayOrder: 1 })
      .lean();

    // 3. Map images to items
    const itemsWithImages = items.map((item) => {
      const itemImages = images.filter(
        (img) => img.itemId.toString() === item._id.toString()
      );

      const primaryImage =
        itemImages.find((img) => img.isPrimary)?.imageUrl ||
        itemImages[0]?.imageUrl ||
        null;

      return {
        ...item,
        images: itemImages.map((img) => img.imageUrl),
        primaryImage
      };
    });

    return res.status(200).json({
      success: true,
      count: itemsWithImages.length,
      data: itemsWithImages
    });
  } catch (error) {
    console.error("getItems error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const getItemsByCategoryId = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    // req.params values can be string | string[] | undefined — normalize to a single string
    const categoryIdStr = Array.isArray(categoryId) ? categoryId[0] : categoryId;

    if (!categoryIdStr || !mongoose.Types.ObjectId.isValid(categoryIdStr)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id"
      });
    }

    // 1. Find items under category
    const items = await Item.find({ categoryId: categoryIdStr })
      .sort({ createdAt: -1 })
      .lean();

    const itemIds = items.map((item) => item._id);

    // 2. Fetch images for all items
    const images = await ItemImage.find({ itemId: { $in: itemIds } })
      .sort({ displayOrder: 1 })
      .lean();

    // 3. Map images to items
    const itemsWithImages = items.map((item) => {
      const itemImages = images.filter(
        (img) => img.itemId.toString() === item._id.toString()
      );

      const primaryImage =
        itemImages.find((img) => img.isPrimary)?.imageUrl ||
        itemImages[0]?.imageUrl ||
        null;

      return {
        ...item,
        images: itemImages.map((img) => img.imageUrl),
        primaryImage
      };
    });

    return res.status(200).json({
      success: true,
      count: itemsWithImages.length,
      data: itemsWithImages
    });
  } catch (error) {
    console.error("getItemsByCategoryId error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
export const getItemsByOwnerId = async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;

    // req.params values can be string | string[] | undefined — normalize to a single string
    const ownerIdStr = Array.isArray(ownerId) ? ownerId[0] : ownerId;

    if (!ownerIdStr || !mongoose.Types.ObjectId.isValid(ownerIdStr)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id"
      });
    }

    // 1. Find items under category
    const items = await Item.find({ ownerId: ownerIdStr })
      .sort({ createdAt: -1 })
      .lean();

    const itemIds = items.map((item) => item._id);

    // 2. Fetch images for all items
    const images = await ItemImage.find({ itemId: { $in: itemIds } })
      .sort({ displayOrder: 1 })
      .lean();

    // 3. Map images to items
    const itemsWithImages = items.map((item) => {
      const itemImages = images.filter(
        (img) => img.itemId.toString() === item._id.toString()
      );

      const primaryImage =
        itemImages.find((img) => img.isPrimary)?.imageUrl ||
        itemImages[0]?.imageUrl ||
        null;

      return {
        ...item,
        images: itemImages.map((img) => img.imageUrl),
        primaryImage
      };
    });

    return res.status(200).json({
      success: true,
      count: itemsWithImages.length,
      data: itemsWithImages
    });
  } catch (error) {
    console.error("getItemsByownerId error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};