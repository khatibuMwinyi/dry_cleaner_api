import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    unit: {
      type: String,
      trim: true,
    },

    reorderLevel: {
      type: Number,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Guardrail: never allow negative stock
inventorySchema.pre("save", function (next) {
  if (this.quantity < 0) {
    return next(new Error("Inventory quantity cannot be negative"));
  }
  next();
});

export default mongoose.model("Inventory", inventorySchema);
