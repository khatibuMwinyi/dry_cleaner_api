import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },
    items: [
      {
        clothingType: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ClothingType",
          required: true
        },
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true
        },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true }
      }
    ],
    subtotal: Number,
    discount: { type: Number, default: 0 },
    total: Number,
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
