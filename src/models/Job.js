import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
    submittedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["waiting", "received", "complete", "success", "denied-admin", "denied-cleaner"],
      default: "waiting",
    },
    receivedDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    verifiedDate: {
      type: Date,
    },
    actualClothCount: {
      type: Number,
      default: 0,
    },
    notedClothCount: {
      type: Number,
      default: 0,
    },
    deniedBy: {
      type: String,
      enum: ["admin", "cleaner", null],
      default: null,
    },
    deniedReason: {
      type: String,
    },
    items: {
      type: [{
        serviceName: String,
        quantity: Number,
      }],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Job", jobSchema);
