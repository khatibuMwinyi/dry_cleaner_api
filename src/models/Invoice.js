import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    clothingTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClothingType",
      required: true
    },
    clothingTypeName: String, // snapshot
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },
    serviceName: String, // snapshot
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },
    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING"
    },
    paidAt: Date,
    checkInDate: {
      type: Date,
      default: Date.now
    },
    pickupDate: Date
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
