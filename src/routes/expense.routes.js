import { Router } from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";
import uploadReceipt from "../middleware/uploadReceipt.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Both roles can create manual expenses (admin requirement) and view expenses
router.post("/", requireAuth, uploadReceipt.single("receipt"), createExpense);
router.get("/", requireAuth, getExpenses);
router.get("/:id", requireAuth, getExpenseById);

// Only moderator manages updates/deletes
router.put("/:id", requireAuth, requireRole("MODERATOR"), uploadReceipt.single("receipt"), updateExpense);
router.delete("/:id", requireAuth, requireRole("MODERATOR"), deleteExpense);

export default router;
