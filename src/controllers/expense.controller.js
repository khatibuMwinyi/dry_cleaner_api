import Expense from "../models/Expense.js";
import cloudinary from "../config/cloudinary.js";

export const createExpense = async (req, res) => {
  try {
    const { category, amount, description, date } = req.body;

    // Hard validation (no silent bugs)
    if (!category || !amount || !date) {
      return res.status(400).json({
        message: "category, amount and date are required",
      });
    }

    const expense = new Expense({
      category: category.trim(),
      amount: Number(amount),
      description: description?.trim(),
      date: new Date(date),
      receiptUrl: req.file?.path || null, // Cloudinary URL
    });

    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({
      message: "Failed to create expense",
      error: error.message,
    });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
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

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Delete receipt from Cloudinary if it exists
    if (expense.receiptUrl) {
      try {
        const publicId = expense.receiptUrl.split("/").pop().split(".")[0];

        await cloudinary.uploader.destroy(`expenses/receipts/${publicId}`);
      } catch (cloudinaryError) {
        console.error("Cloudinary delete failed:", cloudinaryError.message);
        // DO NOT fail the request because of storage
      }
    }

    await expense.deleteOne();

    res.json({ message: "Expense deleted" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};
