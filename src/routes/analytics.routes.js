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

router.get("/financial", requireAuth, requireRole("ADMIN", "MODERATOR"), getFinancialAnalytics);
router.get("/daily", requireAuth, requireRole("ADMIN", "MODERATOR"), getDailyAnalytics);
router.get("/monthly", requireAuth, requireRole("ADMIN", "MODERATOR"), getMonthlyAnalytics);
router.get("/top-customers", requireAuth, requireRole("ADMIN", "MODERATOR"), getTopCustomers);
router.get(
  "/customers/:customerId/expenses",
  requireAuth,
  requireRole("ADMIN", "MODERATOR"),
  getCustomerExpenses,
);

export default router;




