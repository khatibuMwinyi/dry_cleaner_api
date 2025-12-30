import { Router } from "express";
import {
  createClothingType,
  getClothingTypes
} from "../controllers/clothingType.controller.js";

const router = Router();

router.post("/", createClothingType);
router.get("/", getClothingTypes);

export default router;
