import { Router } from "express";
import {
  getFinancialAnalytics,
  getDailyAnalytics,
  getMonthlyAnalytics,
  getTopCustomers,
  getCustomerExpenses,
} from "../controllers/analytics.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/financial", requireAuth, requireRole("ADMIN"), getFinancialAnalytics);
router.get("/daily", requireAuth, requireRole("ADMIN"), getDailyAnalytics);
router.get("/monthly", requireAuth, requireRole("ADMIN"), getMonthlyAnalytics);
router.get("/top-customers", requireAuth, requireRole("ADMIN"), getTopCustomers);
router.get(
  "/customers/:customerId/expenses",
  requireAuth,
  requireRole("ADMIN"),
  getCustomerExpenses,
);

export default router;




