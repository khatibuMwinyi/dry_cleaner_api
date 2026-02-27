import Invoice, { getNextInvoiceNumber } from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import Job from "../models/Job.js";
import { buildInvoiceItems } from "../services/invoice.service.js";
import { generatePdfFromInvoice, generatePdfFromReceipt } from "../utils/pdf.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Service from "../models/Service.js";
import Inventory from "../models/Inventory.js";
import InventoryConsumption from "../models/InventoryConsumption.js";
import ServiceExecution from "../models/ServiceExecution.js";
import Expense from "../models/Expense.js";

const ROOT_DIR = path.resolve(process.cwd());

const tryReadLogo = () => {
  const candidates = [];
  if (process.env.LOGO_PATH) candidates.push(process.env.LOGO_PATH);
  // assets folder (recommended)
  candidates.push(path.resolve(process.cwd(), "assets", "logo.png"));
  candidates.push(path.resolve(process.cwd(), "dry_cleaner_api", "assets", "logo.png"));
  // common locations
  // repo root layout
  candidates.push(
    path.resolve(process.cwd(), "dry_cleaner_api", "src", "logo.png"),
  );
  // when cwd is already dry_cleaner_api
  candidates.push(path.resolve(process.cwd(), "src", "logo.png"));
  candidates.push(path.resolve(process.cwd(), "logo.png"));
  candidates.push(
    path.resolve(process.cwd(), "backend", "src", "assets", "logo.png"),
  );
  candidates.push(path.resolve(process.cwd(), "backend", "logo.png"));
  candidates.push(
    path.resolve(process.cwd(), "frontend", "src", "assets", "logo.png"),
  );
  candidates.push(
    path.resolve(process.cwd(), "dry_cleaner_ui", "src", "assets", "logo.svg"),
  );
  // when cwd is already dry_cleaner_ui
  candidates.push(path.resolve(process.cwd(), "src", "assets", "logo.svg"));

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const ext = path.extname(p).toLowerCase().replace(".", "") || "png";
        const mime = ext === "svg" ? "image/svg+xml" : `image/${ext}`;
        const buf = fs.readFileSync(p);
        const b64 = buf.toString("base64");
        return `data:${mime};base64,${b64}`;
      }
    } catch (e) {
      // continue
    }
  }
  return null;
};

export const createInvoice = async (req, res) => {
  try {
    const { customerId, items, discount = 0, pickupDate } = req.body;

    if (!customerId || !items?.length) {
      return res.status(400).json({ message: "Invalid invoice data" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const { items: invoiceItems, subtotal } = await buildInvoiceItems(items);

    if (discount < 0 || discount > subtotal) {
      return res.status(400).json({ message: "Invalid discount" });
    }

    const total = subtotal - discount;

    const invoiceNumber = await getNextInvoiceNumber();
    const formattedInvoiceNumber = `INV-${String(invoiceNumber).padStart(4, '0')}`;

    const invoice = await Invoice.create({
      invoiceNumber: formattedInvoiceNumber,
      customerId: customer._id,
      items: invoiceItems,
      subtotal,
      discount,
      total,
      checkInDate: new Date(),
      pickupDate: pickupDate ? new Date(pickupDate) : undefined,
    });

    await invoice.populate("customerId", "name phone email");

    const totalClothCount = invoiceItems.reduce((sum, item) => sum + item.quantity, 0);

    await Job.create({
      invoiceId: invoice._id,
      customerName: customer.name,
      customerPhone: customer.phone,
      invoiceNumber: formattedInvoiceNumber,
      submittedDate: new Date(),
      status: "waiting",
      notedClothCount: totalClothCount,
      items: invoiceItems.map(item => ({
        serviceName: item.serviceName,
        quantity: item.quantity,
      })),
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin: execute all services in an invoice (once)
export const executeInvoiceServices = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoice = await Invoice.findById(req.params.id).session(session);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    if (invoice.isExecuted) {
      return res.status(400).json({ message: "Invoice already executed" });
    }

    for (const item of invoice.items) {
      const service = await Service.findById(item.serviceId).session(session);
      if (!service) throw new Error("Service not found");

      const qty = Number(item.quantity || 1);

      // Create service execution record first
      const serviceExecution = await ServiceExecution.create(
        [
          {
            service: service._id,
            basePrice: service.basePrice,
            consumables: [],
            status: "SUCCESS",
            executedBy: req.user?._id,
            invoice: invoice._id,
          },
        ],
        { session },
      );

      const inventoryUsage = [];
      let totalExpenseAmount = 0;

      for (const c of service.consumables) {
        const inventory = await Inventory.findById(c.inventory).session(session);
        if (!inventory) throw new Error("Inventory item missing");

        const quantityToConsume = Number(c.quantity) * qty;
        inventory.consume(quantityToConsume);
        await inventory.save({ session });

        serviceExecution[0].consumables.push({
          inventory: inventory._id,
          quantity: quantityToConsume,
        });

        totalExpenseAmount += quantityToConsume * Number(inventory.costPerUnit || 0);

        await InventoryConsumption.create(
          [
            {
              inventory: inventory._id,
              quantityUsed: quantityToConsume,
              sourceType: "SERVICE",
              sourceId: serviceExecution[0]._id,
              notes: `Invoice ${invoice._id}`,
            },
          ],
          { session },
        );

        inventoryUsage.push({ inventory: inventory._id, quantityUsed: quantityToConsume });
      }

      await serviceExecution[0].save({ session });

      await Expense.create(
        [
          {
            category: "Service Execution",
            amount: totalExpenseAmount,
            date: new Date(),
            serviceExecution: serviceExecution[0]._id,
            invoice: invoice._id,
            inventoryUsage,
          },
        ],
        { session },
      );
    }

    invoice.isExecuted = true;
    invoice.executedAt = new Date();
    invoice.executedBy = req.user?._id;
    await invoice.save({ session });

    await session.commitTransaction();
    return res.json({ message: "Invoice services executed successfully" });
  } catch (err) {
    await session.abortTransaction();
    return res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

export const getInvoices = async (req, res) => {
  try {
    const { customerId, paymentStatus, startDate, endDate } = req.query;
    const query = {};

    if (customerId) query.customerId = customerId;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // Check if dates are provided (not empty strings)
    const hasStartDate = startDate && startDate.trim() !== "";
    const hasEndDate = endDate && endDate.trim() !== "";

    let dateQuery = {};
    if (hasStartDate || hasEndDate) {
      // Use provided date range
      if (hasStartDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateQuery.$gte = start;
      }
      if (hasEndDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery.$lte = end;
      }
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateQuery.$gte = today;
      dateQuery.$lte = tomorrow;
    }
    query.createdAt = dateQuery;

    const invoices = await Invoice.find(query)
      .populate("customerId", "name phone email")
      .populate("executedBy", "email role")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customerId", "name phone email")
      .populate("executedBy", "email role");
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInvoicesByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const invoices = await Invoice.find({ customerId })
      .populate("customerId", "name phone email")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const generateInvoicePdf = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "customerId",
      "name phone email",
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const logoData = tryReadLogo();
    const pdf = await generatePdfFromInvoice(invoice, {
      name: "Oweru International LTD",
      accountNumber: process.env.COMPANY_ACCOUNT || "123456789",
      accountName: process.env.COMPANY_ACCOUNT_NAME || "Oweru International LTD",
      bankName: process.env.COMPANY_BANK || "Any Bank",
      logo: logoData,
      phone: process.env.COMPANY_PHONE || "+255 711 890 764",
      email: process.env.COMPANY_EMAIL || "info@oweru.com",
      address: process.env.COMPANY_ADDRESS || "Tancot House, Posta - Dar es Salaam, Tanzania",
      pobox: process.env.COMPANY_POBOX || "P.O. Box: 7563, Dar es Salaam",
      website: process.env.COMPANY_WEBSITE || "www.oweru.com",
    });
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice-${invoice._id}.pdf`,
    });

    res.send(pdf);
  } catch (error) {
    console.error("PDF generation failed:", error);
    res.status(500).json({ message: "Failed to generate invoice PDF" });
  }
};

export const generateInvoiceFile = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "customerId",
      "name phone email address"
    );
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const outDir = path.join(process.cwd(), "tmp", "invoices");
    const outPath = path.join(outDir, `${invoice._id}.pdf`);

    // ✅ If file already exists, just return URL
    if (fs.existsSync(outPath)) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      return res.json({
        success: true,
        url: `${baseUrl}/invoices/files/${invoice._id}.pdf`,
      });
    }

    // Otherwise generate
    const logoData = tryReadLogo();
    const pdfBuffer = await generatePdfFromInvoice(invoice, {
      name: "Oweru International LTD",
      accountNumber: process.env.COMPANY_ACCOUNT || "123456789",
      accountName: process.env.COMPANY_ACCOUNT_NAME || "Oweru International LTD",
      bankName: process.env.COMPANY_BANK || "Any Bank",
      logo: logoData,
      phone: process.env.COMPANY_PHONE || "+255 711 890 764",
      email: process.env.COMPANY_EMAIL || "info@oweru.com",
      address: process.env.COMPANY_ADDRESS || "Tancot House, Posta - Dar es Salaam, Tanzania",
      pobox: process.env.COMPANY_POBOX || "P.O. Box: 7563, Dar es Salaam",
      website: process.env.COMPANY_WEBSITE || "www.oweru.com",
    });
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, pdfBuffer);

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.json({
      success: true,
      url: `${baseUrl}/invoices/files/${invoice._id}.pdf`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};

export const sendInvoiceViaWhatsAppLink = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "customerId",
      "name phone",
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const outDir = path.join(ROOT_DIR, "tmp", "invoices");
    const outPath = path.join(outDir, `${invoice._id}.pdf`);

    // 🔑 Ensure directory exists
    fs.mkdirSync(outDir, { recursive: true });

    // 🔑 Generate file IF missing
    if (!fs.existsSync(outPath)) {
      const pdfBuffer = await generatePdfFromInvoice(invoice);
      fs.writeFileSync(outPath, pdfBuffer);
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const pdfUrl = `${baseUrl}/invoices/files/${invoice._id}.pdf`;

    const message = `
Hello ${invoice.customerId.name},
Here is your invoice from Oweru International LTD.

Invoice Number: ${invoice.invoiceNumber}
Total: ${invoice.total} TZS

Download PDF:
${pdfUrl}
    `.trim();

    const whatsappLink = `https://wa.me/${
      invoice.customerId.phone
    }?text=${encodeURIComponent(message)}`;

    res.json({ success: true, whatsappLink });
  } catch (err) {
    console.error("WhatsApp send error:", err);
    res.status(500).json({ message: "Failed to prepare WhatsApp invoice" });
  }
};

export const generateReceiptPdf = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "customerId",
      "name phone email",
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.paymentStatus !== "PAID") {
      return res.status(400).json({ message: "Invoice is not paid yet" });
    }

    const logoData = tryReadLogo();
    const pdf = await generatePdfFromReceipt(invoice, {
      name: "Oweru International LTD",
      accountNumber: process.env.COMPANY_ACCOUNT || "123456789",
      accountName: process.env.COMPANY_ACCOUNT_NAME || "Oweru International LTD",
      bankName: process.env.COMPANY_BANK || "Any Bank",
      logo: logoData,
      phone: process.env.COMPANY_PHONE || "+255 711 890 764",
      email: process.env.COMPANY_EMAIL || "info@oweru.com",
      address: process.env.COMPANY_ADDRESS || "Tancot House, Posta - Dar es Salaam, Tanzania",
      pobox: process.env.COMPANY_POBOX || "P.O. Box: 7563, Dar es Salaam",
      website: process.env.COMPANY_WEBSITE || "www.oweru.com",
    });
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=receipt-${invoice._id}.pdf`,
    });

    res.send(pdf);
  } catch (error) {
    console.error("Receipt PDF generation failed:", error);
    res.status(500).json({ message: "Failed to generate receipt PDF" });
  }
};

export const generateReceiptFile = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "customerId",
      "name phone email address"
    );
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.paymentStatus !== "PAID") {
      return res.status(400).json({ message: "Invoice is not paid yet" });
    }

    const outDir = path.join(process.cwd(), "tmp", "receipts");
    const outPath = path.join(outDir, `${invoice._id}.pdf`);

    if (fs.existsSync(outPath)) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      return res.json({
        success: true,
        url: `${baseUrl}/receipts/files/${invoice._id}.pdf`,
      });
    }

    const logoData = tryReadLogo();
    const pdfBuffer = await generatePdfFromReceipt(invoice, {
      name: "Oweru International LTD",
      accountNumber: process.env.COMPANY_ACCOUNT || "123456789",
      accountName: process.env.COMPANY_ACCOUNT_NAME || "Oweru International LTD",
      bankName: process.env.COMPANY_BANK || "Any Bank",
      logo: logoData,
      phone: process.env.COMPANY_PHONE || "+255 711 890 764",
      email: process.env.COMPANY_EMAIL || "info@oweru.com",
      address: process.env.COMPANY_ADDRESS || "Tancot House, Posta - Dar es Salaam, Tanzania",
      pobox: process.env.COMPANY_POBOX || "P.O. Box: 7563, Dar es Salaam",
      website: process.env.COMPANY_WEBSITE || "www.oweru.com",
    });
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, pdfBuffer);

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.json({
      success: true,
      url: `${baseUrl}/receipts/files/${invoice._id}.pdf`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate receipt" });
  }
};

export const sendReceiptViaWhatsApp = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "customerId",
      "name phone",
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.paymentStatus !== "PAID") {
      return res.status(400).json({ message: "Invoice is not paid yet" });
    }

    const outDir = path.join(ROOT_DIR, "tmp", "receipts");
    const outPath = path.join(outDir, `${invoice._id}.pdf`);

    fs.mkdirSync(outDir, { recursive: true });

    if (!fs.existsSync(outPath)) {
      const pdfBuffer = await generatePdfFromReceipt(invoice);
      fs.writeFileSync(outPath, pdfBuffer);
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const receiptUrl = `${baseUrl}/receipts/files/${invoice._id}.pdf`;

    const message = `
Hello ${invoice.customerId.name},
Your payment has been received! Thank you for choosing Oweru International LTD.

Receipt Number: ${invoice.invoiceNumber}
Amount Paid: ${invoice.total} TZS

View your receipt here:
${receiptUrl}

Thank you for your business!
    `.trim();

    const whatsappLink = `https://wa.me/${
      invoice.customerId.phone
    }?text=${encodeURIComponent(message)}`;

    res.json({ success: true, whatsappLink });
  } catch (err) {
    console.error("WhatsApp receipt send error:", err);
    res.status(500).json({ message: "Failed to send receipt via WhatsApp" });
  }
};
