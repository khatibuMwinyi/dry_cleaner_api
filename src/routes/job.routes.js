import { Router } from "express";
import {
  getJobs,
  getJobById,
  getJobByInvoiceId,
  receiveJob,
  executeJob,
  verifyJob,
  denyJob,
  sendPickupNotification,
} from "../controllers/job.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRole("CLERK", "OPERATOR", "ADMIN"), getJobs);
router.get("/invoice/:invoiceId", requireAuth, requireRole("CLERK", "OPERATOR", "ADMIN"), getJobByInvoiceId);
router.get("/:id", requireAuth, requireRole("CLERK", "OPERATOR", "ADMIN"), getJobById);
router.patch("/:id/receive", requireAuth, requireRole("OPERATOR"), receiveJob);
router.patch("/:id/execute", requireAuth, requireRole("OPERATOR"), executeJob);
router.patch("/:id/verify", requireAuth, requireRole("CLERK"), verifyJob);
router.patch("/:id/deny", requireAuth, requireRole("CLERK", "OPERATOR"), denyJob);
router.post("/:id/send-pickup-notification", requireAuth, requireRole("CLERK"), sendPickupNotification);

export default router;
