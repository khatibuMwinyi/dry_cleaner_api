import { Router } from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  getInvoicesByCustomer,
  generateInvoicePdf,
  sendInvoicePdf,
  generateInvoiceFile,
} from "../controllers/invoice.controller.js";
import { markInvoiceAsPaid } from "../controllers/invoice.update.controller.js";

const router = Router();

router.post("/", createInvoice);
router.get("/", getInvoices);
router.get("/customer/:customerId", getInvoicesByCustomer);
router.get("/:id", getInvoiceById);
router.post("/:id/pay", markInvoiceAsPaid);
router.get("/:id/pdf", generateInvoicePdf);
router.get("/:id/file", generateInvoiceFile);
router.post("/:id/send", sendInvoicePdf);

export default router;
