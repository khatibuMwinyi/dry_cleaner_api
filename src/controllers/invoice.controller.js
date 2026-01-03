import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import { buildInvoiceItems } from "../services/invoice.service.js";
import { generatePdf } from "../utils/pdf.js";
import { invoiceTemplate } from "../templates/invoice.template.js";
import { sendInvoiceEmail } from "../utils/mailer.js";

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
    const invoice = await Invoice.findById(req.params.id)
      .populate("customerId", "name phone email");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const html = invoiceTemplate({
      invoice,
      company: { name: "Oweru International LTD" }
    });

    const pdf = await generatePdf(html);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice-${invoice._id}.pdf`
    });

    res.send(pdf);
  } catch (error) {
    console.error("PDF generation failed:", error);
    res.status(500).json({ message: "Failed to generate invoice PDF" });
  }
};

export const sendInvoicePdf = async (req, res) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        message: "Email service not configured on server"
      });
    }

    const invoice = await Invoice.findById(req.params.id)
      .populate("customerId", "name phone email");

    if (!invoice || !invoice.customerId.email) {
      return res.status(400).json({ message: "Customer email missing" });
    }

    const html = invoiceTemplate({
      invoice,
      company: { name: "Oweru International LTD" }
    });

    const pdf = await generatePdf(html);

    await sendInvoiceEmail({
      to: invoice.customerId.email,
      pdf,
      invoiceId: invoice._id
    });

    res.json({ message: "Invoice sent successfully" });

  } catch (error) {
    console.error("Email send failed:", error);
    res.status(500).json({ message: "Failed to send invoice" });
  }
};
