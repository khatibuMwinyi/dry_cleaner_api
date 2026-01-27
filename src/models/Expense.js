import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true },

    receiptUrl: {
      type: String,
    },
    receiptPublicId: String,
    
    // Link to service execution
    serviceExecution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceExecution",
    },
    
    // Inventory usage details
    inventoryUsage: [
      {
        inventory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
        },
        quantityUsed: {
          type: Number,
          required: true,
        },
      },
    ],
    
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("Expense", expenseSchema);
