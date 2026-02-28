export const receiptTemplate = ({ invoice, company = {} }) => {
  const formatTZS = (amount) =>
    new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    const months = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const invoiceDate = formatDate(invoice.createdAt);
  const paidDate = formatDate(invoice.paidAt || invoice.updatedAt);
  const invoiceNumber = invoice.invoiceNumber || `INV-${invoice._id.toString().slice(-4).padStart(4, '0')}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Receipt ${invoiceNumber}</title>

<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
    background: #fff;
  }

  .page {
    display: grid;
    grid-template-columns: 1fr 300px;
    min-height: 100vh;
  }

  .content {
    padding: 60px 50px;
    background: #fff;
  }

  h1 {
    font-size: 64px;
    margin: 0;
    font-weight: 800;
    color: #0F172A;
    line-height: 1;
  }

  .receipt-badge {
    display: inline-block;
    background: #22c55e;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    margin-top: 10px;
  }

  .company-name {
    font-size: 16px;
    margin-top: 10px;
    color: #0F172A;
    font-weight: 600;
  }

  .customer-info {
    margin-top: 50px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .customer-info h3 {
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .customer-info p {
    font-size: 14px;
    color: #111;
    margin: 4px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 40px;
  }

  th {
    text-align: left;
    font-size: 12px;
    color: #666;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;
  }

  th.num {
    text-align: right;
  }

  td {
    padding: 16px 0;
    font-size: 14px;
    vertical-align: top;
    border-bottom: 1px solid #f3f4f6;
    color: #111;
  }

  td.num {
    text-align: right;
    white-space: nowrap;
  }

  .item-col {
    width: 50%;
  }

  .summary {
    margin-top: 40px;
    max-width: 350px;
    margin-left: auto;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 14px;
  }

  .summary-row.total {
    font-weight: 700;
    font-size: 16px;
    border-top: 2px solid #0F172A;
    margin-top: 12px;
    padding-top: 12px;
    color: #0F172A;
  }

  .thank-you {
    margin-top: 50px;
    font-weight: 700;
    font-size: 18px;
    color: #0F172A;
  }

  .sidebar {
    background: #f6e6c9;
    padding: 50px 30px;
    font-size: 13px;
  }

  .sidebar .date {
    font-weight: 700;
    font-size: 16px;
    color: #0F172A;
    margin-bottom: 30px;
  }

  .sidebar h3 {
    font-size: 11px;
    margin: 25px 0 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #666;
    font-weight: 600;
  }

  .sidebar p {
    color: #111;
    font-size: 14px;
    margin: 4px 0;
  }

  .payment-info {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
  }

  .payment-info p {
    margin: 6px 0;
    font-size: 13px;
  }

  .paid-badge {
    display: inline-block;
    background: #22c55e;
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }

  footer {
    grid-column: 1 / -1;
    background: linear-gradient(to right, #d4a24c 0%, #d4a24c 50%, #f6e6c9 50%);
    padding: 30px 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .logo-container {
    width: 100px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-container img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .footer-info {
    color: #111;
  }

  .footer-info strong {
    display: block;
    font-size: 14px;
    margin-bottom: 4px;
    color: #0F172A;
  }

  .footer-info p {
    margin: 2px 0;
    font-size: 12px;
  }

  .footer-pattern {
    flex: 1;
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(0,0,0,0.05) 10px,
      rgba(0,0,0,0.05) 20px
    );
  }
</style>
</head>

<body>
<div class="page">

  <div class="content">
    <h1>Receipt</h1>
    <div class="receipt-badge">PAID</div>
    <div class="company-name">${company.name || "Oweru International LTD"}</div>

    ${invoice.customerId ? `
    <div class="customer-info">
      <h3>Bill To</h3>
      <p><strong>${invoice.customerId.name || "N/A"}</strong></p>
      ${invoice.customerId.phone ? `<p>Phone: ${invoice.customerId.phone}</p>` : ''}
      ${invoice.customerId.email ? `<p>Email: ${invoice.customerId.email}</p>` : ''}
      ${invoice.customerId.address ? `<p>Address: ${invoice.customerId.address}</p>` : ''}
    </div>
    ` : ''}

    <table>
      <thead>
        <tr>
          <th class="item-col">Item</th>
          <th class="num">Qty</th>
          <th class="num">Unit Price</th>
          <th class="num">Total</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items
          .map(
            (it) => `
          <tr>
            <td class="item-col">
              <strong>${it.serviceName}</strong>
            </td>
            <td class="num">${it.quantity}</td>
            <td class="num">${formatTZS(it.unitPrice)}</td>
            <td class="num">${formatTZS(it.totalPrice)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>${formatTZS(invoice.subtotal)}</span>
      </div>
      ${invoice.discount > 0 ? `
      <div class="summary-row">
        <span>Discount</span>
        <span>${formatTZS(invoice.discount)}</span>
      </div>
      ` : ''}
      <div class="summary-row total">
        <span>Total</span>
        <span>${formatTZS(invoice.total)}</span>
      </div>
    </div>

    <div class="thank-you">Thank you for your payment!</div>
  </div>

  <aside class="sidebar">
    <div class="date">${paidDate}</div>

    <h3>Receipt</h3>
    <p>#${invoiceNumber}</p>

    <h3>Payment Status</h3>
    <p><span class="paid-badge">PAID</span></p>

    <h3>Invoice Date</h3>
    <p>${invoiceDate}</p>

    <div class="payment-info">
      <h3 style="margin-top: 0;">Payment</h3>
      <p><strong>${company.bankName || "Any Bank"}</strong></p>
      <p>Account: ${company.accountName || company.name || "Oweru International LTD"}</p>
      <p>Number: ${company.accountNumber || "123456789"}</p>
      <p>Amount Paid: ${formatTZS(invoice.total)}</p>
    </div>
  </aside>

  <footer>
    <div class="footer-left">
      ${company.logo ? `
      <div class="logo-container">
        <img src="${company.logo}" alt="Logo" />
      </div>
      ` : `
      <div class="logo-container" style="background: #d4a24c; color: #111; font-weight: 700; font-size: 18px; border-radius: 4px;">
        OW
      </div>
      `}
      <div class="footer-info">
        <strong>${company.name || "Oweru International LTD"}</strong>
        <p>${company.phone || "+255 711 890 764"}</p>
        <p>${company.email || "info@oweru.com"}</p>
        <p>${company.address || "Tancot House, Posta - Dar es Salaam, Tanzania"}</p>
        ${company.pobox ? `<p>${company.pobox}</p>` : ''}
        ${company.website ? `<p>${company.website}</p>` : ''}
      </div>
    </div>
    <div class="footer-pattern"></div>
  </footer>

</div>
</body>
</html>
`;
};
