import { Router } from "express";
import {
  getFinancialAnalytics,
  getDailyAnalytics,
  getMonthlyAnalytics,
  getTopCustomers,
  getCustomerExpenses,
  getMonthlyReportData,
  generateMonthlyReportPDF,
  getWeeklyReportData,
  generateWeeklyReportPDF,
  getDailyReportData,
  generateDailyReportPDF,
} from "../controllers/analytics.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/financial", requireAuth, requireRole("ADMIN", "CLERK"), getFinancialAnalytics);
router.get("/daily", requireAuth, requireRole("ADMIN", "CLERK"), getDailyAnalytics);
router.get("/monthly", requireAuth, requireRole("ADMIN", "CLERK"), getMonthlyAnalytics);
router.get("/top-customers", requireAuth, requireRole("ADMIN", "CLERK"), getTopCustomers);
router.get(
  "/customers/:customerId/expenses",
  requireAuth,
  requireRole("ADMIN", "CLERK"),
  getCustomerExpenses,
);
router.post(
  "/reports/monthly-pdf",
  requireAuth,
  requireRole("ADMIN", "CLERK"),
  getMonthlyReportData,
);
router.post(
  "/reports/monthly-pdf/download",
  requireAuth,
  requireRole("ADMIN", "CLERK"),
  generateMonthlyReportPDF,
);
router.post(
  "/reports/weekly-pdf",
  requireAuth,
  requireRole("ADMIN", "CLERK"),
  getWeeklyReportData,
);
router.post(
  "/reports/weekly-pdf/download",
  requireAuth,
  requireRole("ADMIN", "CLERK"),
  generateWeeklyReportPDF,
);
router.post(
  "/reports/daily-pdf",
  requireAuth,
  requireRole("ADMIN", "CLERK"),
  getDailyReportData,
);
router.post(
  "/reports/daily-pdf/download",
  requireAuth,
  requireRole("ADMIN", "CLERK"),
  generateDailyReportPDF,
);

export default router;




