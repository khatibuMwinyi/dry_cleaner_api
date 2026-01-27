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

router.post("/", requireAuth, requireRole("MODERATOR"), createInventory);
router.get("/", requireAuth, requireRole("MODERATOR"), getInventories);
router.get("/low-stock", requireAuth, requireRole("MODERATOR"), getLowStockItems);
router.get("/:id", requireAuth, requireRole("MODERATOR"), getInventoryById);
router.put("/:id", requireAuth, requireRole("MODERATOR"), updateInventory);
router.delete("/:id", requireAuth, requireRole("MODERATOR"), deleteInventory);

export default router;





