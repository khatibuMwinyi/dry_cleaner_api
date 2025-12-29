import { Router } from "express";
import {
  createCustomer,
  getCustomers
} from "../controllers/customer.controller.js";

const router = Router();

router.post("/", createCustomer);
router.get("/", getCustomers);

export default router;
