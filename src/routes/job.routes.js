import { Router } from "express";
import {
  getJobs,
  getJobById,
  getJobByInvoiceId,
  receiveJob,
  executeJob,
  verifyJob,
  denyJob,
} from "../controllers/job.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRole("ADMIN", "CLEANER", "MODERATOR"), getJobs);
router.get("/invoice/:invoiceId", requireAuth, requireRole("ADMIN", "CLEANER", "MODERATOR"), getJobByInvoiceId);
router.get("/:id", requireAuth, requireRole("ADMIN", "CLEANER", "MODERATOR"), getJobById);
router.patch("/:id/receive", requireAuth, requireRole("CLEANER"), receiveJob);
router.patch("/:id/execute", requireAuth, requireRole("CLEANER"), executeJob);
router.patch("/:id/verify", requireAuth, requireRole("ADMIN"), verifyJob);
router.patch("/:id/deny", requireAuth, requireRole("ADMIN", "CLEANER"), denyJob);

export default router;
