import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: String
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
