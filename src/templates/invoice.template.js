export const invoiceTemplate = ({ invoice, company = {} }) => {
  const formatTZS = (amount) =>
    new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${invoice._id}</title>

<style>
  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
  }

  .page {
    display: grid;
    grid-template-columns: 1fr 260px;
    min-height: 100vh;
  }

  .content {
    padding: 48px 40px;
  }

  h1 {
    font-size: 56px;
    margin: 0;
    font-weight: 800;
  }

  .company {
    font-size: 14px;
    margin-top: 6px;
    color: #444;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 48px;
    table-layout: fixed;
  }

  th {
    text-align: left;
    font-size: 13px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 10px;
  }

  td {
    padding: 12px 0;
    font-size: 14px;
    vertical-align: top;
    border-bottom: 1px solid #eee;
    word-break: break-word;
  }

  .item-col {
    width: 45%;
  }

  .num {
    text-align: right;
    white-space: nowrap;
  }

  .summary {
    margin-top: 32px;
    max-width: 320px;
    margin-left: auto;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
  }

  .summary-row.total {
    font-weight: 700;
    border-top: 1px solid #000;
    margin-top: 8px;
    padding-top: 10px;
  }

  .thank-you {
    margin-top: 60px;
    font-weight: 700;
  }

  .sidebar {
    background: #f6e6c9;
    padding: 40px 24px;
    font-size: 13px;
  }

  .sidebar h3 {
    font-size: 12px;
    margin: 24px 0 6px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .date {
    font-weight: 700;
    font-size: 14px;
  }

  footer {
    grid-column: 1 / -1;
    background: #f6e6c9;
    padding: 24px 40px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
  }

  .logo {
    width: 90px;
  }
</style>
</head>

<body>
<div class="page">

  <div class="content">
    <h1>Invoice</h1>
    <div class="company">${company.name || "Oweru International LTD"}</div>

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
              <strong>${it.clothingTypeName}</strong><br/>
              <small>${it.serviceName}</small>
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
      <div class="summary-row">
        <span>Discount</span>
        <span>${formatTZS(invoice.discount || 0)}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>${formatTZS(invoice.total)}</span>
      </div>
    </div>

    <div class="thank-you">Thank you!</div>
  </div>

  <aside class="sidebar">
    <div class="date">
      ${new Date(invoice.createdAt).toLocaleDateString("en-GB")}
    </div>

    <h3>Invoice</h3>
    <p>#${invoice._id}</p>

    <h3>Payment Status</h3>
    <p>${invoice.paymentStatus}</p>

    <h3>Due Date</h3>
    <p>
      ${invoice.pickupDate
        ? new Date(invoice.pickupDate).toLocaleDateString("en-GB")
        : "—"}
    </p>
  </aside>

  <footer>
    <div>
      <strong>${company.name || "Oweru"}</strong><br/>
      ${company.phone || "+255 711 890 764"}<br/>
      ${company.email || "info@oweru.com"}<br/>
      ${company.address || "Dar es Salaam, Tanzania"}
    </div>

    <!-- INLINE SVG LOGO -->
    <svg class="logo" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="40" fill="#d4a24c"/>
      <text x="50" y="26" text-anchor="middle"
        font-size="18" fill="#111" font-weight="700">
        Oweru
      </text>
    </svg>
  </footer>

</div>
</body>
</html>
`;
};
