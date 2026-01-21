import { Router } from "express";
import {
  createService,
  getServices,
  updateService,
  deleteService,
  getServiceExecutions,
} from "../controllers/service.controller.js";
import { executeService } from "../controllers/serviceExecution.controller.js";

const router = Router();

router.post("/", createService);
router.get("/", getServices);
router.put("/:id", updateService);
router.delete("/:id", deleteService);
router.post("/:serviceId/execute", executeService);
router.get("/executions", getServiceExecutions);

export default router;
