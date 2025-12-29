import mongoose from "mongoose";

const clothingTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pricing: {
      type: Map,
      of: Number
    }
  },
  { timestamps: true }
);

export default mongoose.model("ClothingType", clothingTypeSchema);
