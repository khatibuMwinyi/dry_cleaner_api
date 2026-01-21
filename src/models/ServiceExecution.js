import mongoose from "mongoose";

const serviceExecutionSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    executedAt: {
      type: Date,
      default: Date.now,
    },

    basePrice: {
      type: Number,
      required: true,
    },

    consumables: [
      {
        inventory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
  },
  { timestamps: true },
);

export default mongoose.model("ServiceExecution", serviceExecutionSchema);
