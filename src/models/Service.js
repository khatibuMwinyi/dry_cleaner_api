import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["MEN", "WOMEN", "KIDS", "BEDDING", "CURTAINS", "HOUSEHOLD ITEMS"],
    },

    subCategory: {
      type: String,
      required: true,
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Inventory consumption definition
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
          min: 0,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    solventUsed: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
