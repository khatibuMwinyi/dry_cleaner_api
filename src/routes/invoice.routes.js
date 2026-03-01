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
  generateReceiptPdf,
  generateReceiptFile,
  sendReceiptViaWhatsApp,
} from "../controllers/invoice.controller.js";
import { markInvoiceAsPaid } from "../controllers/invoice.update.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, requireRole("CLERK"), createInvoice);
router.get("/", requireAuth, requireRole("CLERK"), getInvoices);
router.get("/customer/:customerId", requireAuth, requireRole("CLERK"), getInvoicesByCustomer);
router.get("/:id", requireAuth, requireRole("CLERK"), getInvoiceById);
router.get("/:id/preview", requireAuth, requireRole("ADMIN", "CLERK"), getInvoiceById);
router.post("/:id/pay", requireAuth, requireRole("CLERK"), markInvoiceAsPaid);
router.post("/:id/execute", requireAuth, requireRole("CLERK"), executeInvoiceServices);
router.get("/:id/pdf", requireAuth, requireRole("CLERK"), generateInvoicePdf);
router.get("/:id/file", requireAuth, requireRole("CLERK"), generateInvoiceFile);
router.post("/:id/send-whatsapp", requireAuth, requireRole("CLERK"), sendInvoiceViaWhatsAppLink);
router.get("/:id/receipt/pdf", requireAuth, requireRole("CLERK"), generateReceiptPdf);
router.get("/:id/receipt/file", requireAuth, requireRole("CLERK"), generateReceiptFile);
router.post("/:id/send-receipt", requireAuth, requireRole("CLERK"), sendReceiptViaWhatsApp);

export default router;
