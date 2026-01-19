import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, required: true },

    receiptUrl: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Expense", expenseSchema);
