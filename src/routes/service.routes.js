import { Router } from "express";
import {
  createService,
  getServices,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";

const router = Router();

router.post("/", createService);
router.get("/", getServices);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;
