export const invoiceTemplate = ({ invoice, company }) => {
  const subtotal = invoice.items.reduce(
    (s, it) => s + (it.price || 0) * (it.quantity || 0),
    0
  );

  const tax = invoice.tax || 0;
  const taxAmount = +(subtotal * tax).toFixed(2);
  const total = +(subtotal + taxAmount - (invoice.discount || 0)).toFixed(2);

  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  body { font-family: Helvetica, Arial, sans-serif; margin:0; }
  .page { width:210mm; height:297mm; position:relative; }

  .content {
    display:flex;
    min-height: calc(297mm - 140px);
  }

  .left {
    width:65%;
    padding:28px 36px 18px 48px;
    box-sizing:border-box;
  }

  .right {
    width:35%;
    background:#f3dec6;
    padding:28px;
    box-sizing:border-box;
    position:relative;
  }

  .brand { font-size:56px; font-weight:800; margin:0; }
  .company-name { font-size:12px; margin-top:6px; }

  table { width:100%; border-collapse:collapse; margin-top:28px; }
  th, td { font-size:12px; padding:8px 6px; text-align:left; }
  th { font-weight:700; }

  .footer-band {
    position:absolute;
    bottom:0;
    left:0;
    width:100%;
    height:140px;
    background:#eed8bf;
    display:flex;
    justify-content:space-between;
    padding:18px 36px;
    box-sizing:border-box;
  }

  .pattern-box {
    width:180px;
    background:#d6b37a;
    background-image:
      linear-gradient(45deg, rgba(255,255,255,.06) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(255,255,255,.06) 25%, transparent 25%);
    background-size:20px 20px;
  }
</style>
</head>

<body>
<div class="page">

  <div class="content">
    <div class="left">
      <h1 class="brand">Invoice</h1>
      <div class="company-name">${company.name || ""}</div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Hours</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items
            .map(
              (it) => `
            <tr>
              <td>${(it.itemName || it.serviceName || "").replace(
                /</g,
                "&lt;"
              )}</td>
              <td>${it.quantity || 0}</td>
              <td>$${(it.price || 0).toFixed(2)}</td>
              <td>$${((it.price || 0) * (it.quantity || 0)).toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div style="width:230px; margin-left:auto; margin-top:16px;">
        <div style="display:flex; justify-content:space-between;">
          <span>Subtotal</span><span>$${subtotal.toFixed(2)}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>Tax ${(tax * 100).toFixed(0)}%</span><span>$${taxAmount.toFixed(
    2
  )}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-weight:800; margin-top:8px;">
          <span>Total</span><span>$${total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="right">
      <div style="text-align:right;">
        <div style="font-weight:800; font-size:22px;">${
          company.name || ""
        }</div>
        <div style="margin-top:12px;">Invoice</div>
        <div style="margin-top:18px;">#${invoice._id}</div>
        <div style="margin-top:12px;">
          Due: ${
            invoice.dueDate
              ? new Date(invoice.dueDate).toLocaleDateString()
              : ""
          }
        </div>
      </div>

      <div style="margin-top:24px; font-size:12px;">
        <strong>Payment</strong><br/>
        ${company.name || ""}<br/>
        Account: ${company.accountNumber || ""}
      </div>
    </div>
  </div>

  <div class="footer-band">
    <div style="display:flex; gap:14px;">
      ${company.logo ? `<img src="${company.logo}" width="86"/>` : ""}
      <div style="font-size:11px;">
        <strong>${company.name || ""}</strong><br/>
        ${company.phone || ""}<br/>
        ${company.email || ""}<br/>
        ${company.address || ""}
      </div>
    </div>
    <div class="pattern-box"></div>
  </div>

</div>
</body>
</html>
`;
};
