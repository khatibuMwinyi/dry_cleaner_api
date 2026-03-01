import { Router } from "express";
import {
  createInventory,
  getInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
  getLowStockItems,
} from "../controllers/inventory.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// ADMIN only - full access
router.post("/", requireAuth, requireRole("ADMIN"), createInventory);
router.put("/:id", requireAuth, requireRole("ADMIN"), updateInventory);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteInventory);

// ADMIN and CLERK - read-only access
router.get("/", requireAuth, requireRole("ADMIN", "CLERK"), getInventories);
router.get("/low-stock", requireAuth, requireRole("ADMIN", "CLERK"), getLowStockItems);
router.get("/:id", requireAuth, requireRole("ADMIN", "CLERK"), getInventoryById);

export default router;





