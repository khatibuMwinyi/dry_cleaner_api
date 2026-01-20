import mongoose from "mongoose";
import Inventory from "../models/Inventory.js";

// CREATE
export const createInventory = async (req, res) => {
  try {
    const { name, quantity, unit, reorderLevel } = req.body;

    if (!name || quantity == null) {
      return res.status(400).json({ message: "Name and quantity are required" });
    }

    const item = await Inventory.create({
      name: name.trim(),
      quantity: Number(quantity),
      unit: unit?.trim() || null,
      reorderLevel:
        reorderLevel != null ? Number(reorderLevel) : null,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Create inventory error:", error);
    res.status(500).json({ message: "Failed to create inventory item" });
  }
};

// READ ALL
export const getInventories = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error("Fetch inventory error:", error);
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
};

// READ ONE
export const getInventoryById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid inventory ID" });
  }

  try {
    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("Fetch inventory by ID error:", error);
    res.status(500).json({ message: "Failed to fetch inventory item" });
  }
};

// UPDATE
export const updateInventory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid inventory ID" });
  }

  try {
    const updated = await Inventory.findByIdAndUpdate(
      id,
      {
        ...req.body,
        quantity:
          req.body.quantity != null ? Number(req.body.quantity) : undefined,
        reorderLevel:
          req.body.reorderLevel != null
            ? Number(req.body.reorderLevel)
            : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update inventory error:", error);
    res.status(500).json({ message: "Failed to update inventory" });
  }
};

// DELETE
export const deleteInventory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid inventory ID" });
  }

  try {
    const deleted = await Inventory.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.json({ message: "Inventory deleted" });
  } catch (error) {
    console.error("Delete inventory error:", error);
    res.status(500).json({ message: "Failed to delete inventory" });
  }
};

// LOW STOCK
export const getLowStockItems = async (req, res) => {
  try {
    const items = await Inventory.find({
      reorderLevel: { $ne: null },
      $expr: { $lte: ["$quantity", "$reorderLevel"] },
    });

    res.json(items);
  } catch (error) {
    console.error("Low stock error:", error);
    res.status(500).json({ message: "Failed to fetch low stock items" });
  }
};
