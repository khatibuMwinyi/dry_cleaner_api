import { Router } from "express";
import {
  getFinancialAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getTopCustomers,
  getCustomerExpenses,
} from "../controllers/analytics.controller.js";

const router = Router();

router.get("/financial", getFinancialAnalytics);
router.get("/weekly", getWeeklyAnalytics);
router.get("/monthly", getMonthlyAnalytics);
router.get("/top-customers", getTopCustomers);
router.get("/customers/:customerId/expenses", getCustomerExpenses);

export default router;




