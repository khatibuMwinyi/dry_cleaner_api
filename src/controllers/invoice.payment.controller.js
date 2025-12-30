// Payment Locking (Immutable After Paid)
import Invoice from "../models/Invoice.js";

export const markInvoicePaid = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found" });
  }

  if (invoice.paymentStatus === "PAID") {
    return res.status(400).json({ message: "Invoice already paid" });
  }

  invoice.paymentStatus = "PAID";
  invoice.paidAt = new Date();

  await invoice.save();

  res.json(invoice);
};
