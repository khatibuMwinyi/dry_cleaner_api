import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import { buildInvoiceItems } from "../services/invoice.service.js";
import { generatePdfFromInvoice } from "../utils/pdf.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import fs from "fs";
import path from "path";

const tryReadLogo = () => {
  const candidates = [];
  if (process.env.LOGO_PATH) candidates.push(process.env.LOGO_PATH);
  // common locations
  candidates.push(
    path.resolve(process.cwd(), "backend", "src", "assets", "logo.png")
  );
  candidates.push(path.resolve(process.cwd(), "backend", "logo.png"));
  candidates.push(path.resolve(process.cwd(), "logo.png"));
  candidates.push(
    path.resolve(process.cwd(), "frontend", "src", "assets", "logo.png")
  );

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

    const invoice = await Invoice.create({
      customerId: customer._id,
      items: invoiceItems,
      subtotal,
      discount,
      total,
      checkInDate: new Date(), // Automatically set to current date
      pickupDate: pickupDate ? new Date(pickupDate) : undefined,
    });

    await invoice.populate("customerId", "name phone email");
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const { customerId, paymentStatus, startDate, endDate } = req.query;
    const query = {};

    if (customerId) query.customerId = customerId;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(query)
      .populate("customerId", "name phone email")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "customerId",
      "name phone email"
    );
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
      "name phone email"
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const logoData = tryReadLogo();
    const pdf = await generatePdfFromInvoice(invoice, {
      name: "Oweru International LTD",
      accountNumber: process.env.COMPANY_ACCOUNT || "",
      logo: logoData,
      phone: process.env.COMPANY_PHONE,
      email: process.env.COMPANY_EMAIL,
      address: process.env.COMPANY_ADDRESS,
      pobox: process.env.COMPANY_POBOX,
      website: process.env.COMPANY_WEBSITE,
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
      "name phone email"
    );

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const logoData = tryReadLogo();
    const pdfBuffer = await generatePdfFromInvoice(invoice, {
      name: "Oweru International LTD",
      accountNumber: process.env.COMPANY_ACCOUNT || "",
      logo: logoData,
      phone: process.env.COMPANY_PHONE,
      email: process.env.COMPANY_EMAIL,
      address: process.env.COMPANY_ADDRESS,
      pobox: process.env.COMPANY_POBOX,
      website: process.env.COMPANY_WEBSITE,
    });

    const outDir = path.resolve(process.cwd(), "tmp", "invoices");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${invoice._id}.pdf`);
    fs.writeFileSync(outPath, pdfBuffer);

    const baseUrl =
      process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`;
    const publicUrl = `${baseUrl}/invoices/files/${invoice._id}.pdf`;

    res.json({ url: publicUrl, path: outPath });
  } catch (error) {
    console.error("Failed saving invoice PDF:", error);
    res.status(500).json({ message: "Failed to create invoice file" });
  }
};

export const sendInvoiceViaWhatsAppLink = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate({
    path: "customerId",
    select: "name phone email",
  });

  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found" });
  }

  // 1. Generate PDF
  const pdfBuffer = await generatePdfFromInvoice(invoice);

  // 2. Upload PDF
  const result = await uploadToCloudinary(pdfBuffer);
 

  // 3. WhatsApp message
  const phone = invoice.customerId.phone; // international format
  const message = `
Hello ${invoice.customerId.name},
Here is your invoice from Oweru International LTD.
Invoice ID: ${invoice._id}
Total: ${invoice.total} TZS

Download PDF:
${result.secure_url}
  `.trim();

  const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(
    message
  )}`;

  res.json({
    success: true,
    whatsappLink,
  });
};
