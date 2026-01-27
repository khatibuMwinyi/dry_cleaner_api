import Expense from "../models/Expense.js";
import Inventory from "../models/Inventory.js";
import InventoryConsumption from "../models/InventoryConsumption.js";
import cloudinary from "../config/cloudinary.js";

export const createExpense = async (req, res) => {
  try {
    const {
      category,
      amount,
      description,
      date,
      inventoryUsage = [],
    } = req.body;

    if (!category || !amount || !date) {
      return res.status(400).json({
        message: "category, amount and date are required",
      });
    }

    const expense = await Expense.create({
      category,
      amount,
      description,
      date,
      receiptUrl: req.file?.path || null,
      receiptPublicId: req.file?.filename || null,
    });

    //  INVENTORY CONSUMPTION
    for (const usage of inventoryUsage) {
      const inventory = await Inventory.findById(usage.inventoryId);

      if (!inventory) {
        throw new Error("Inventory item not found");
      }

      if (inventory.quantity < usage.quantityUsed) {
        throw new Error(
          `Not enough stock for ${inventory.name}`
        );
      }

      // decrement inventory
      inventory.quantity -= usage.quantityUsed;
      await inventory.save();

      // record consumption
      await InventoryConsumption.create({
        inventory: inventory._id,
        quantityUsed: usage.quantityUsed,
        sourceType: "EXPENSE",
        sourceId: expense._id,
      });
    }

    res.status(201).json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({
      message: error.message || "Failed to create expense",
    });
  }
};
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ isDeleted: false })
      .populate({
        path: "serviceExecution",
        populate: {
          path: "service",
          select: "name basePrice",
        },
      })
      .populate("inventoryUsage.inventory", "name unit")
      .sort({
        date: -1,
      });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate({
        path: "serviceExecution",
        populate: {
          path: "service",
          select: "name basePrice",
        },
      })
      .populate("inventoryUsage.inventory", "name unit");
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expense" });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        receiptUrl: req.file?.path || req.body.receiptUrl,
      },
      { new: true },
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update expense" });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    // Idempotent delete
    if (!expense) {
      return res.json({ message: "Expense already deleted" });
    }

    // Delete receipt from Cloudinary FIRST
    if (expense.receiptPublicId) {
      try {
        await cloudinary.uploader.destroy(expense.receiptPublicId);
      } catch (err) {
        console.error("Cloudinary delete failed:", err.message);
        // We still continue — user intent is delete
      }
    }

    // Delete from DB
    await Expense.findByIdAndDelete(expense._id);

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({
      message: "Failed to delete expense",
      error: error.message,
    });
  }
};
