import mongoose from "mongoose";

const inventoryConsumptionSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    quantityUsed: {
      type: Number,
      required: true,
      min: 0,
    },

    sourceType: {
      type: String,
      enum: ["EXPENSE", "SERVICE"],
      required: true,
    },

    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model(
  "InventoryConsumption",
  inventoryConsumptionSchema
);
