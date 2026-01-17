import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    clothingTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClothingType",
      required: true,
    },
    clothingTypeName: {
      type: String,
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    items: {
      type: [invoiceItemSchema],
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "UNPAID",
    },

    checkInDate: {
      type: Date,
      default: Date.now,
    },

    pickupDate: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);

export default mongoose.model("Invoice", invoiceSchema);
