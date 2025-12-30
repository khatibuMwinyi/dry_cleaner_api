import Inventory from "../models/Inventory.js";

export const createInventory = async (req, res) => {
  try {
    const { name, quantity, unit, reorderLevel } = req.body;

    if (!name || quantity === undefined || quantity < 0) {
      return res.status(400).json({ message: "Invalid inventory data" });
    }

    const inventory = await Inventory.create({
      name,
      quantity,
      unit,
      reorderLevel,
    });

    res.status(201).json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInventories = async (req, res) => {
  try {
    const inventories = await Inventory.find().sort({ name: 1 });
    res.json(inventories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { name, quantity, unit, reorderLevel } = req.body;

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    if (name) inventory.name = name;
    if (quantity !== undefined) {
      if (quantity < 0) {
        return res.status(400).json({ message: "Quantity cannot be negative" });
      }
      inventory.quantity = quantity;
    }
    if (unit !== undefined) inventory.unit = unit;
    if (reorderLevel !== undefined) inventory.reorderLevel = reorderLevel;

    await inventory.save();
    res.json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLowStockItems = async (req, res) => {
  try {
    const items = await Inventory.find({
      $expr: {
        $lte: ["$quantity", "$reorderLevel"],
      },
    }).sort({ quantity: 1 });

    res.json(items);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};




