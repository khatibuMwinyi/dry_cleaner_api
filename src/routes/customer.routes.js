import { Router } from "express";
import {
  createCustomer,
  getCustomers,
  updateCustomer
} from "../controllers/customer.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, requireRole("CLERK"), createCustomer);
router.get("/", requireAuth, requireRole("CLERK"), getCustomers);
router.put("/:id", requireAuth, requireRole("CLERK"), updateCustomer);

export default router;
