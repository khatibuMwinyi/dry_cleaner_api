import { Router } from "express";
import { login, registerAdmin } from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/register-admin", requireAuth, requireRole("MODERATOR"), registerAdmin);

export default router;


