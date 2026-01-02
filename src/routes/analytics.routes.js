import { Router } from "express";
import {
  getFinancialAnalytics,
  getDailyAnalytics,
  getMonthlyAnalytics,
  getTopCustomers,
  getCustomerExpenses,
} from "../controllers/analytics.controller.js";

const router = Router();

router.get("/financial", getFinancialAnalytics);
router.get("/daily", getDailyAnalytics);
router.get("/monthly", getMonthlyAnalytics);
router.get("/top-customers", getTopCustomers);
router.get("/customers/:customerId/expenses", getCustomerExpenses);

export default router;




