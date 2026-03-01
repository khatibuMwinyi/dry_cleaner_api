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

// Both roles can create manual expenses (clerk requirement) and view expenses
router.post("/", requireAuth, uploadReceipt.single("receipt"), createExpense);
router.get("/", requireAuth, getExpenses);
router.get("/:id", requireAuth, getExpenseById);

// Only admin manages updates/deletes
router.put("/:id", requireAuth, requireRole("ADMIN"), uploadReceipt.single("receipt"), updateExpense);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteExpense);

export default router;
