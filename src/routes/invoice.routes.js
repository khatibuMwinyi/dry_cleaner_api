import { Router } from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  getInvoicesByCustomer,
  generateInvoicePdf,
  sendInvoiceViaWhatsAppLink,
  generateInvoiceFile,
  executeInvoiceServices,
} from "../controllers/invoice.controller.js";
import { markInvoiceAsPaid } from "../controllers/invoice.update.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, requireRole("ADMIN"), createInvoice);
router.get("/", requireAuth, requireRole("ADMIN"), getInvoices);
router.get("/customer/:customerId", requireAuth, requireRole("ADMIN"), getInvoicesByCustomer);
router.get("/:id", requireAuth, requireRole("ADMIN"), getInvoiceById);
router.post("/:id/pay", requireAuth, requireRole("ADMIN"), markInvoiceAsPaid);
router.post("/:id/execute", requireAuth, requireRole("ADMIN"), executeInvoiceServices);
router.get("/:id/pdf", requireAuth, requireRole("ADMIN"), generateInvoicePdf);
router.get("/:id/file", requireAuth, requireRole("ADMIN"), generateInvoiceFile);
router.post("/:id/send-whatsapp", requireAuth, requireRole("ADMIN"), sendInvoiceViaWhatsAppLink);

export default router;
