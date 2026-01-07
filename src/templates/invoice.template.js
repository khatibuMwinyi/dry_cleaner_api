export const invoiceTemplate = ({ invoice, company }) => {
  const subtotal = invoice.items.reduce(
    (s, it) => s + (it.unitPrice || 0) * (it.quantity || 0),
    0
  );

  const taxRate = invoice.tax || 0;
  const taxAmount = +(subtotal * taxRate).toFixed(2);
  const total = +(subtotal + taxAmount - (invoice.discount || 0)).toFixed(2);

  const formatCurrency = (n) => {
    return `TSh ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  body { font-family: Helvetica, Arial, sans-serif; margin:0; color: #2b3e50; }
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

  .brand { font-size:56px; font-weight:800; margin:0; color: #0b2844; }
  .company-name { font-size:12px; margin-top:6px; color: #0b2844; }

  table { width:100%; border-collapse:collapse; margin-top:28px; }
  th, td { font-size:11px; padding:8px 6px; text-align:left; }
  th { font-weight:700; border-bottom: 2px solid #ddd; }
  td { padding: 10px 6px; border-bottom: 1px solid #eee; }

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

  .summary {
    width:240px;
    margin-left:auto;
    margin-top:16px;
  }

  .summary-row {
    display:flex;
    justify-content:space-between;
    font-size: 11px;
    padding: 4px 0;
  }

  .summary-row.total {
    font-weight:800;
    font-size: 13px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 2px solid #ddd;
  }

  .bill-section h3 {
    font-size: 11px;
    font-weight: 700;
    margin: 12px 0 6px 0;
    color: #0b2844;
  }

  .bill-section p {
    font-size: 10px;
    margin: 4px 0;
  }
</style>
</head>

<body>
<div class="page">

  <div class="content">
    <div class="left">
      <h1 class="brand">Invoice</h1>
      <div class="company-name">${company.name || "Oweru International LTD"}</div>

      <div class="bill-section">
        <h3>Billed To</h3>
        <p><strong>${invoice.customerId?.name || ''}</strong></p>
        <p>Phone: ${invoice.customerId?.phone || ''}</p>
        <p>Email: ${invoice.customerId?.email || ''}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Service</th>
            <th style="text-align:right; width:50px;">Qty</th>
            <th style="text-align:right; width:80px;">Unit Price</th>
            <th style="text-align:right; width:80px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items
            .map(
              (it) => `
            <tr>
              <td>${it.clothingTypeName || it.clothingType?.name || 'Item'}</td>
              <td>${it.serviceName || it.service?.name || ''}</td>
              <td style="text-align:right;">${it.quantity || 0}</td>
              <td style="text-align:right;">${formatCurrency(it.unitPrice || 0)}</td>
              <td style="text-align:right;">${formatCurrency((it.unitPrice || 0) * (it.quantity || 0))}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-row">
          <span>Subtotal</span><span>${formatCurrency(subtotal)}</span>
        </div>
        ${invoice.discount > 0 ? `
        <div class="summary-row">
          <span>Discount</span><span>${formatCurrency(invoice.discount)}</span>
        </div>
        ` : ''}
        <div class="summary-row total">
          <span>Total</span><span>${formatCurrency(total)}</span>
        </div>
      </div>
    </div>

    <div class="right">
      <div style="text-align:right;">
        <div style="font-weight:800; font-size:18px; color:#0b2844;">${
          company.name || "Oweru International"
        }</div>
        <div style="margin-top:12px; font-size: 12px;">Invoice</div>
        <div style="margin-top:12px; font-weight: 700;">#${invoice._id.toString().slice(-6).toUpperCase()}</div>
        <div style="margin-top:8px; font-size: 10px;">
          Date: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString('en-US')}
        </div>
        ${invoice.pickupDate ? `
        <div style="margin-top:4px; font-size: 10px;">
          Pickup: ${new Date(invoice.pickupDate).toLocaleDateString('en-US')}
        </div>
        ` : ''}
      </div>

      <div style="margin-top:20px; font-size:10px;">
        <strong style="color: #0b2844;">Payment Status</strong><br/>
        ${invoice.paymentStatus === 'PAID' ? '<span style="color:green; font-weight:700;">✓ PAID</span>' : '<span style="color:#ff9800; font-weight:700;">⏳ PENDING</span>'}
      </div>

      ${company.accountNumber ? `
      <div style="margin-top:16px; font-size:10px;">
        <strong style="color: #0b2844;">Payment Details</strong><br/>
        Account: ${company.accountNumber}<br/>
        Name: ${company.name || ''}
      </div>
      ` : ''}
    </div>
  </div>

  <div class="footer-band">
    <div style="display:flex; gap:14px; align-items:center;">
      ${company.logo ? `<img src="${company.logo}" width="86" style="max-height:60px; object-fit:contain;"/>` : ""}
      <div style="font-size:10px;">
        <strong style="color: #0b2844;">${company.name || "Oweru International"}</strong><br/>
        ${company.phone ? `Phone: ${company.phone}<br/>` : ''}
        ${company.email ? `Email: ${company.email}<br/>` : ''}
        ${company.address ? `${company.address}` : ''}
      </div>
    </div>
    <div style="text-align:right; font-size:9px; color:#666;">
      <em>Generated on ${new Date().toLocaleDateString('en-US')}</em>
    </div>
  </div>
</div>

</body>
</html>
  `;
};

