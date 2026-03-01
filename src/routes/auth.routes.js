import { Router } from "express";
import { login, registerUser } from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/register-user", requireAuth, requireRole("ADMIN"), registerUser);

export default router;


