import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const A4_WIDTH = 595.28; // points
const A4_HEIGHT = 841.89;

const formatCurrency = (n) => `$${Number(n || 0).toFixed(2)}`;

export const generatePdfFromInvoice = async (invoice, company = {}) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const marginLeft = 44;
  const marginRight = 36;
  const contentTop = A4_HEIGHT - 52;
  const footerHeight = 120;
  const contentHeight = A4_HEIGHT - footerHeight - 72; // leave room
  const rightPanelWidth = (A4_WIDTH - marginLeft) * 0.34;

  // Title and header spacing (adjusted)
  page.drawText("Invoice", {
    x: marginLeft,
    y: contentTop - 12,
    size: 56,
    font: fontBold,
    color: rgb(0.043, 0.153, 0.262),
  });

  // Small paragraph under heading (company display)
  page.drawText(company.name || "Oweru International LTD", {
    x: marginLeft,
    y: contentTop - 48,
    size: 12,
    font: font,
    color: rgb(0.043, 0.153, 0.262),
  });

  // Right panel full height (no right margin) and structured content
  const rightX = A4_WIDTH - rightPanelWidth; // touch right edge
  page.drawRectangle({ x: rightX, y: 0, width: rightPanelWidth, height: A4_HEIGHT, color: rgb(0.945, 0.91, 0.82) });
  const rpInnerX = rightX + 20;
  let rpY = A4_HEIGHT - 60;
  page.drawText(new Date(invoice.createdAt).toLocaleDateString(), { x: rpInnerX, y: rpY, size: 14, font: fontBold, color: rgb(0.043, 0.153, 0.262) });
  rpY -= 26;
  page.drawText("Invoice", { x: rpInnerX, y: rpY, size: 11, font: font });
  rpY -= 16;
  page.drawText(`#${invoice._id}`, { x: rpInnerX, y: rpY, size: 12, font: fontBold });
  rpY -= 26;

  // Payment block with well-structured label/value pairs
  page.drawText("Payment", { x: rpInnerX, y: rpY, size: 13, font: fontBold });
  rpY -= 18;
  const paymentLines = [
    { label: "Bank", value: company.bank || "Any Bank" },
    { label: "Account", value: company.accountNumber || "Oweru International LTD" },
    { label: "Number", value: company.accountNumber || "123456789" },
    { label: "Due Date", value: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '' }
  ];
  for (const pl of paymentLines) {
    page.drawText(pl.label, { x: rpInnerX, y: rpY, size: 10, font: fontBold, color: rgb(0.043, 0.153, 0.262) });
    page.drawText(pl.value, { x: rpInnerX, y: rpY - 12, size: 10, font, color: rgb(0.043, 0.153, 0.262) });
    rpY -= 32;
  }
  // Payment block
  page.drawText("Payment", { x: rpInnerX, y: rpY, size: 13, font: fontBold });
  rpY -= 18;
  page.drawText(company.name || "", { x: rpInnerX, y: rpY, size: 10, font });
  rpY -= 14;
  page.drawText(`Account: ${company.accountNumber || ''}`, { x: rpInnerX, y: rpY, size: 10, font });
  rpY -= 14;
  page.drawText(`Number: ${company.accountNumber || ''}`, { x: rpInnerX, y: rpY, size: 10, font });
  rpY -= 14;
  page.drawText(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}`, { x: rpInnerX, y: rpY, size: 10, font });

  // Billed to
  const billedY = contentTop - 80;
  page.drawText("Billed To", { x: marginLeft, y: billedY, size: 11, font: fontBold });
  page.drawText(invoice.customerId?.name || "", { x: marginLeft, y: billedY - 16, size: 10, font });
  page.drawText(invoice.customerId?.phone || "", { x: marginLeft, y: billedY - 30, size: 10, font });
  page.drawText(invoice.customerId?.email || "", { x: marginLeft, y: billedY - 44, size: 10, font });

  // Table header
  const tableTop = billedY - 62;
  const colX = marginLeft;
  // Restrict table width so it does not enter the right panel area
  const contentWidth = A4_WIDTH - marginLeft - marginRight - rightPanelWidth - 12; // gutter
  const colWidths = {
    item: contentWidth * 0.56,
    hours: 44,
    unit: Math.max(72, (contentWidth * 0.2) - 20),
    total: Math.max(72, (contentWidth * 0.24) - 20),
  };

  let x = colX;
  page.drawText("Item", { x, y: tableTop, size: 10, font: fontBold });
  x += colWidths.item;
  page.drawText("Hours", { x, y: tableTop, size: 10, font: fontBold });
  x += colWidths.hours;
  page.drawText("Unit Price", { x, y: tableTop, size: 10, font: fontBold });
  x += colWidths.unit;
  page.drawText("Total", { x, y: tableTop, size: 10, font: fontBold });

  // Table rows
  let rowY = tableTop - 20;
  const rowHeight = 20;
  for (const it of invoice.items) {
    if (rowY < footerHeight + 60) break; // avoid overlapping footer vertically
    x = colX;
    const name = (it.itemName || it.serviceName || "").toString();
    // clamp item text width so it doesn't overflow into right panel
    page.drawText(name, { x, y: rowY, size: 10, font, maxWidth: colWidths.item });
    x += colWidths.item;
    page.drawText((it.quantity || 0).toString(), {
      x,
      y: rowY,
      size: 10,
      font,
    });
    x += colWidths.hours;
    page.drawText(formatCurrency(it.price || 0), {
      x,
      y: rowY,
      size: 10,
      font,
    });
    x += colWidths.unit;
    const itemTotal = (it.price || 0) * (it.quantity || 0);
    page.drawText(formatCurrency(itemTotal), { x, y: rowY, size: 10, font });

    rowY -= rowHeight;
  }

  // Summary box on right
  // Place summary box left of right panel
  const summaryX = marginLeft + contentWidth - 180;
  const summaryY = rowY - 6;
  const subtotal = invoice.items.reduce(
    (s, i) => s + (i.price || 0) * (i.quantity || 0),
    0
  );
  const taxRate = invoice.tax || 0;
  const taxAmount = +(subtotal * taxRate).toFixed(2);
  const total = +(subtotal + taxAmount - (invoice.discount || 0)).toFixed(2);

  page.drawText("Subtotal", { x: summaryX, y: summaryY, size: 10, font });
  page.drawText(formatCurrency(subtotal), {
    x: summaryX + 140,
    y: summaryY,
    size: 10,
    font,
  });
  page.drawText(`Tax ${Math.round(taxRate * 100)}%`, {
    x: summaryX,
    y: summaryY - 16,
    size: 10,
    font,
  });
  page.drawText(formatCurrency(taxAmount), {
    x: summaryX + 140,
    y: summaryY - 16,
    size: 10,
    font,
  });
  page.drawText("Total", {
    x: summaryX,
    y: summaryY - 36,
    size: 12,
    font: fontBold,
  });
  page.drawText(formatCurrency(total), {
    x: summaryX + 140,
    y: summaryY - 36,
    size: 12,
    font: fontBold,
  });

  // Footer band
  const footerY = 0; // bottom
  page.drawRectangle({ x: 0, y: footerY, width: A4_WIDTH, height: footerHeight, color: rgb(0.93, 0.85, 0.78) });

  // Footer left: logo and contact
  let logoImg;
  if (company.logo) {
    try {
      if (company.logo.startsWith("data:")) {
        // PNG/JPEG data
        const base64 = company.logo.split(",")[1];
        const bytes = Buffer.from(base64, 'base64');
        // try PNG embed
        try {
          logoImg = await pdfDoc.embedPng(bytes);
        } catch (e) {
          try {
            logoImg = await pdfDoc.embedJpg(bytes);
          } catch (e2) {
            logoImg = null;
          }
        }
      }
    } catch (e) {
      logoImg = null;
    }
  } else {
    // try to load backend/logo.png from filesystem via relative path not allowed here; controllers set company.logo
  }

  const footerLeftX = marginLeft;
  const footerLogoY =
    footerY + footerHeight - 16 - (logoImg ? logoImg.height / 2 : 0);
  if (logoImg) {
    const imgW = logoImg.width || 200;
    const imgH = logoImg.height || 200;
    const drawW = 86;
    const drawH = Math.round((imgH / imgW) * drawW);
    page.drawImage(logoImg, { x: footerLeftX, y: footerY + 18, width: drawW, height: drawH });
  }

  const contactX = footerLeftX + 96;
  const contactY = footerY + footerHeight - 28;
  page.drawText(company.name || "", {
    x: contactX,
    y: contactY,
    size: 11,
    font: fontBold,
    color: rgb(0.04, 0.15, 0.27),
  });
  page.drawText(company.phone || "+255 711 890 764", {
    x: contactX,
    y: contactY - 14,
    size: 10,
    font,
  });
  page.drawText(company.email || "info@oweru.com", {
    x: contactX,
    y: contactY - 28,
    size: 10,
    font,
  });
  page.drawText(
    company.address || "Tancot House, Posta - Dar es Salaam, Tanzania",
    { x: contactX, y: contactY - 42, size: 9, font }
  );
  page.drawText(`P.O. Box: ${company.pobox || "7563, Dar es Salaam"}`, {
    x: contactX,
    y: contactY - 56,
    size: 9,
    font,
  });
  page.drawText(company.website || "www.oweru.com", {
    x: contactX,
    y: contactY - 70,
    size: 9,
    font,
  });

  // Pattern box on right
  const patternW = 180;
  const patternX = A4_WIDTH - marginRight - patternW;
  page.drawRectangle({ x: patternX, y: footerY, width: patternW, height: footerHeight, color: rgb(0.83, 0.69, 0.48) });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

export default generatePdfFromInvoice;
