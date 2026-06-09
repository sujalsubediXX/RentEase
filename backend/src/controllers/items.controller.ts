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
    const items = await Item.aggregate([
      {
        $lookup: {
          from: "itemimages",
          localField: "_id",
          foreignField: "itemId",
          as: "image",
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          categoryId: 1,
          ownerId: 1,
          createdAt: 1,
          updatedAt: 1,
          image: {
            $map: {
              input: "$image",
              as: "img",
              in: "$$img.imageUrl",
            },
          },
        },
      },
    ]);

    res.status(200).json(items);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
};


export const getItemsByID = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
   
    const item = await Item.findById(id).lean();

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

   
    const images = await ItemImage.find({
      itemId: item._id
    }).lean();

    const result = {
      ...item,
      images: images.map((img) => img.imageUrl)  
    };

    res.json(result);  
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};