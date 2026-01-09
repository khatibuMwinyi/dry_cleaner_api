import Expense from "../models/Expense.js";

export const createExpense = async (req, res) => {
  try {
    const { category, amount, description, date, receiptNumber, receiptScreenshot } = req.body;

    if (!category || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid expense data" });
    }

    const expense = await Expense.create({
      category,
      amount,
      description,
      receiptNumber,
      receiptScreenshot,
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (category) {
      query.category = category;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res.status(400).json({ message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { category, amount, description, date, receiptNumber, receiptScreenshot } = req.body;

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (category) expense.category = category;
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be positive" });
      }
      expense.amount = amount;
    }
    if (description !== undefined) expense.description = description;
    if (receiptNumber !== undefined) expense.receiptNumber = receiptNumber;
    if (receiptScreenshot !== undefined) expense.receiptScreenshot = receiptScreenshot;
    if (date) expense.date = new Date(date);

    await expense.save();
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};





