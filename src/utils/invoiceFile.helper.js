import fs from "fs";
import path from "path";
import { generatePdfFromInvoice } from "./pdf.js";

const ROOT_DIR = path.resolve(process.cwd());

export const ensureInvoicePdfFile = async (invoice) => {
  const outDir = path.join(ROOT_DIR, "tmp", "invoices");
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, `${invoice._id}.pdf`);

  if (!fs.existsSync(outPath)) {
    const pdfBuffer = await generatePdfFromInvoice(invoice);
    fs.writeFileSync(outPath, pdfBuffer);
  }

  return outPath;
};
