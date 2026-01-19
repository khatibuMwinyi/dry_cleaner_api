import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "expenses/receipts",
    allowedFormats: ["jpg", "png", "jpeg", "webp", "pdf"],
  },
});

const uploadReceipt = multer({ storage });

export default uploadReceipt;
