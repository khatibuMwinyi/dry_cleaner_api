import { Router } from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";
import uploadReceipt from "../middleware/uploadReceipt.js";

const router = Router();

router.post("/", uploadReceipt.single("receipt"), createExpense);
router.get("/", getExpenses);
router.get("/:id", getExpenseById);
router.put("/:id", uploadReceipt.single("receipt"), updateExpense);
router.delete("/:id", deleteExpense);

export default router;
