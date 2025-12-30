// Protect Invoice Mutability
import Invoice from "../models/Invoice.js";

export const markInvoiceAsPaid = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found" });
  }

  if (invoice.paymentStatus === "PAID") {
    return res.status(400).json({ message: "Invoice already paid" });
  }

  invoice.paymentStatus = "PAID";
  await invoice.save();

  res.json(invoice);
};
