import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import { buildInvoiceItems } from "../services/invoice.service.js";

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
