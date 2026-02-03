import { Router } from "express";
import {
  getFinancialAnalytics,
  getDailyAnalytics,
  getMonthlyAnalytics,
  getTopCustomers,
  getCustomerExpenses,
  getMonthlyReportData,
  generateMonthlyReportPDF,
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
router.post(
  "/reports/monthly-pdf",
  requireAuth,
  requireRole("ADMIN", "MODERATOR"),
  getMonthlyReportData,
);
router.post(
  "/reports/monthly-pdf/download",
  requireAuth,
  requireRole("ADMIN", "MODERATOR"),
  generateMonthlyReportPDF,
);

export default router;




