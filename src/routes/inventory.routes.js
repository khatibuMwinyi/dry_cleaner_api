import { Router } from "express";
import {
  createInventory,
  getInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
  getLowStockItems,
} from "../controllers/inventory.controller.js";

const router = Router();

router.post("/", createInventory);
router.get("/", getInventories);
router.get("/low-stock", getLowStockItems);
router.get("/:id", getInventoryById);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

export default router;





