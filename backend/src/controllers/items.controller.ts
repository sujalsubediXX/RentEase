import mongoose from "mongoose";
import type { Request, Response } from "express";
import ItemImage from "../models/itemsImage.model.ts";
import Item  from "../models/items.model.ts";
import type { IItem } from "../models/items.model.ts";

import { getFeaturedItems, getRecommendedForUser, getMostRentedItems } from "../utils/recommendation.ts";
import fs from "fs/promises";
import path from "path";


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
    const items = await Item.find()
      .populate('ownerId', 'fullName email phoneNumber')  
      .populate('categoryId', 'name')                     
      .populate('images')                                 
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: items
    });
  } catch (error: any) {
    console.error("Error fetching items:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch items"
    });
  }
};

import { Types } from "mongoose";


interface GetItemsQuery {
  page?: string;
  limit?: string;
  category?: string;
  status?: "active" | "inactive" | "flagged";
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
export const getItemsforAdmin = async (req:Request, res:Response) => {


  try {
    // Cast + coerce every query param to a plain string up front —
    // this is what fixes the ParsedQs errors at the source
    const {
      page = "1",
      limit = "12",
      category,
      status,
      search,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as GetItemsQuery;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, any> = {};

    if (category) query.categoryId = new Types.ObjectId(category);

    if (status === "active") {
      query.isApproved = true;
      query.isActive = true;
    }
    if (status === "inactive") query.isActive = false;
    if (status === "flagged") query.isApproved = false; // adjust if you add a real isFlagged field

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.title = { $regex: search.trim(), $options: "i" };
    }

    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortDirection };

    const [totalCount, items] = await Promise.all([
      Item.countDocuments(query),
      Item.find(query)
        .populate("ownerId", "name")
        .populate("categoryId", "name")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean<IItem[]>(), // <-- typed lean() fixes every "does not exist on {}" error
    ]);

    const itemIds = items.map((item) => item._id);

    const images = await ItemImage.find({ itemId: { $in: itemIds } })
      .sort({ displayOrder: 1 })
      .lean();

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
        primaryImage,
      };
    });

    return res.status(200).json({
      success: true,
      count: itemsWithImages.length,
      total: totalCount,
      page: pageNum,
      totalPages: Math.max(Math.ceil(totalCount / limitNum), 1),
      data: itemsWithImages,
    });
  } catch (error) {
    console.error("getItems error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
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




export const fetchFeaturedItems = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 8, 24);
    const items = await getFeaturedItems(limit);
    res.json({ success: true, data: items });
  } catch (err) {
    console.error("Error fetching featured items:", err);
    res.status(500).json({ success: false, message: "Failed to load featured items" });
  }
}

export const recommendedItemsHandler = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 8, 24);
    const userId = (req as any).user?.id;

    if (!userId) {
      const items = await getFeaturedItems(limit);
      return res.json({ success: true, personalized: false, data: items });
    }

    const items = await getRecommendedForUser(userId, limit);
    res.json({ success: true, personalized: true, data: items });
  } catch (err) {
    console.error("Error fetching recommended items:", err);
    res.status(500).json({ success: false, message: "Failed to load recommendations" });
  }
}





export const fetchMostRentedItems = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 8, 24);
    const items = await getMostRentedItems(limit);
    res.json({ success: true, data: items });
  } catch (err) {
    console.error("Error fetching most rented items:", err);
    res.status(500).json({ success: false, message: "Failed to load most rented items" });
  }
};




export const updateAvailability = async (
  req: Request,
  res: Response
) => {
  try {

    const { availability } = req.body;
    console.log(availability)

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      {
        availability
      },
      {
        returnDocument: "after"
      }
    );


    if (!item) {
      return res.status(404).json({
        message: "Item not found"
      });
    }


    res.status(200).json({
      success: true,
      item
    });


  } catch (error: any) {

    res.status(500).json({
      message: error.message
    });

  }
}




export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

   
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    // Ownership check — only the owner (or an admin, if you add that role) can delete
    const requesterId = (req as any).user?.id;
    if (!requesterId || item.ownerId.toString() !== requesterId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this item"
      });
    }

    // Find associated images so we can remove the files from disk too
    const images = await ItemImage.find({ itemId: item._id });

    await Promise.all(
      images.map(async (img) => {
        try {
          // imageUrl is stored like "/uploads/items/filename.jpg"
          const filePath = path.join(process.cwd(), img.imageUrl);
          await fs.unlink(filePath);
        } catch (err) {
          // Don't fail the whole delete just because a file was already missing
          console.warn(`Could not remove file for image ${img._id}:`, err);
        }
      })
    );

    await ItemImage.deleteMany({ itemId: item._id });
    await Item.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Item deleted successfully"
    });
  } catch (error: unknown) {
    console.error("deleteItem error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ success: false, message });
  }
};