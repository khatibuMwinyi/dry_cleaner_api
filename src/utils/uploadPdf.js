import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadInvoicePdf = (pdfBuffer, invoiceId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "invoices",
        public_id: `invoice-${invoiceId}`,
        resource_type: "raw",
        format: "pdf",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(pdfBuffer).pipe(stream);
  });
};
