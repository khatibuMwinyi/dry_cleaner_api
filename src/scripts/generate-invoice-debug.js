import fs from "fs";
import path from "path";
import generatePdfFromInvoice from "../utils/pdf.js";

const invoice = {
  _id: Date.now().toString(),
  createdAt: new Date().toISOString(),
  pickupDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  items: [
    {
      serviceName: "Shirt - Laundry",
      quantity: 3,
      unitPrice: 2000,
      totalPrice: 6000,
    },
    {
      serviceName: "Suit - Dry Clean",
      quantity: 1,
      unitPrice: 8000,
      totalPrice: 8000,
    },
  ],
  subtotal: 14000,
  discount: 0,
  total: 14000,
  paymentStatus: "PAID",
  customerId: {
    name: "John Doe",
    phone: "+255 700 000 000",
    email: "john@example.com",
    address: "123 Sample St, Dar es Salaam",
  },
};

// Point to local repo logo so template resolves and embeds it
const company = {
  name: "Oweru International LTD",
  phone: "+255 711 890 764",
  email: "info@oweru.com",
  address: "Tancot House, Posta - Dar es Salaam, Tanzania",
  logo: "assets/logo.png",
  bankName: "Any Bank",
  accountNumber: "123456789",
};

async function run() {
  try {
    const pdfBuffer = await generatePdfFromInvoice(invoice, company);

    const outDir = path.join(process.cwd(), "tmp", "invoices");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, "debug-invoice.pdf");
    fs.writeFileSync(outPath, pdfBuffer);
    console.log("Generated PDF:", outPath);
  } catch (err) {
    console.error("Error generating PDF:", err);
    process.exit(1);
  }
}

run();
