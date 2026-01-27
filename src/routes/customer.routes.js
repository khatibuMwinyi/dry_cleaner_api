import { Router } from "express";
import {
  createCustomer,
  getCustomers
} from "../controllers/customer.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, requireRole("ADMIN"), createCustomer);
router.get("/", requireAuth, requireRole("ADMIN"), getCustomers);

export default router;
