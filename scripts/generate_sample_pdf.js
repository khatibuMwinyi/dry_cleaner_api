import fs from "fs";
import path from "path";
import { generatePdfFromInvoice } from "../src/utils/pdf.js";

(async () => {
  try {
    // sample invoice data
    const invoice = {
      _id: "sample-0001",
      createdAt: new Date(),
      items: [
        { itemName: "Property Consultation", quantity: 3, price: 150 },
        { itemName: "Open House", quantity: 1, price: 200 },
        { itemName: "Marketing Services", quantity: 5, price: 50 },
      ],
      tax: 0.05,
      discount: 0,
      customerId: {
        name: "Sample Customer",
        phone: "+255711000000",
        email: "sample@example.com",
      },
    };

    // try to include a logo if present in common locations
    const tryLogo = () => {
      const candidates = [
        process.env.LOGO_PATH,
        path.resolve(process.cwd(), "backend", "src", "assets", "logo.png"),
        path.resolve(process.cwd(), "backend", "logo.png"),
        path.resolve(process.cwd(), "logo.png"),
        path.resolve(process.cwd(), "frontend", "src", "assets", "logo.png"),
      ].filter(Boolean);
      for (const p of candidates) {
        try {
          if (fs.existsSync(p)) {
            const ext = path.extname(p).toLowerCase().replace(".", "") || "png";
            const mime = ext === "svg" ? "image/svg+xml" : `image/${ext}`;
            const b = fs.readFileSync(p);
            return `data:${mime};base64,${b.toString("base64")}`;
          }
        } catch (e) {}
      }
      return null;
    };

    const logo = tryLogo();

    const pdfBuffer = await generatePdfFromInvoice(invoice, {
      name: "Oweru International LTD",
      accountNumber: "123456789",
      logo,
      phone: "+255 711 890 764",
      email: "info@oweru.com",
      address: "Tancot House, Posta - Dar es Salaam, Tanzania",
      pobox: "7563, Dar es Salaam",
      website: "www.oweru.com",
    });

    const outDir = path.resolve(process.cwd(), "tmp", "invoices");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${invoice._id}.pdf`);
    fs.writeFileSync(outPath, pdfBuffer);
    console.log("Sample PDF generated at", outPath);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
