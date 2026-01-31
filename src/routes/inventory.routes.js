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

// MODERATOR only - full access
router.post("/", requireAuth, requireRole("MODERATOR"), createInventory);
router.put("/:id", requireAuth, requireRole("MODERATOR"), updateInventory);
router.delete("/:id", requireAuth, requireRole("MODERATOR"), deleteInventory);

// ADMIN and MODERATOR - read-only access
router.get("/", requireAuth, requireRole("ADMIN", "MODERATOR"), getInventories);
router.get("/low-stock", requireAuth, requireRole("ADMIN", "MODERATOR"), getLowStockItems);
router.get("/:id", requireAuth, requireRole("ADMIN", "MODERATOR"), getInventoryById);

export default router;





