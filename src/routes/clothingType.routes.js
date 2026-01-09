import { Router } from "express";
import {
  createClothingType,
  getClothingTypes,
  getClothingTypeById,
  updateClothingType,
  deleteClothingType,
} from "../controllers/clothingType.controller.js";

const router = Router();

router.post("/", createClothingType);
router.get("/", getClothingTypes);
router.get("/:id", getClothingTypeById);
router.put("/:id", updateClothingType);
router.delete("/:id", deleteClothingType);

export default router;
