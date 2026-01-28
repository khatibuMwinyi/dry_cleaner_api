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

    costPerUnit: {
      type: Number,
      min: 0,
      default: 0,
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
inventorySchema.pre("save", function () {
  if (this.quantity < 0) {
    return (new Error("Inventory quantity cannot be negative"));
  }
  
});

// CENTRALIZED inventory consumption logic
inventorySchema.methods.consume = function (amount) {
  if (amount <= 0) {
    throw new Error("Consumption amount must be positive");
  }

  if (this.quantity < amount) {
    throw new Error(`Insufficient stock for ${this.name}`);
  }

  this.quantity -= amount;
};

export default mongoose.model("Inventory", inventorySchema);
