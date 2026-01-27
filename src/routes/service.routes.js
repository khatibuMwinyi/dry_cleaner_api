import { Router } from "express";
import {
  createService,
  getServices,
  updateService,
  deleteService,
  getServiceExecutions,
} from "../controllers/service.controller.js";
import { executeService } from "../controllers/serviceExecution.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getServices);
router.post("/", requireAuth, requireRole("MODERATOR"), createService);
router.put("/:id", requireAuth, requireRole("MODERATOR"), updateService);
router.delete("/:id", requireAuth, requireRole("MODERATOR"), deleteService);

// Admin-only execution
router.post("/:serviceId/execute", requireAuth, requireRole("ADMIN"), executeService);

// Allow both roles to view executions
router.get("/executions", requireAuth, getServiceExecutions);

export default router;
