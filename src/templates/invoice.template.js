export const invoiceTemplate = ({ invoice, company = {} }) => {
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
      "JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
      "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const invoiceDate = formatDate(invoice.createdAt);
  const dueDate = formatDate(invoice.pickupDate);
  const invoiceNumber =
    invoice.invoiceNumber ||
    `INV-${invoice._id.toString().slice(-4).padStart(4, "0")}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${invoiceNumber}</title>

<style>
  :root {
    --navy: #0B1B2B;
    --gold: #D4A24C;
    --sand: #F4E5CF;
    --cream: #FAF6EF;
    --light-gray: #EAEAEA;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Arial, Helvetica, sans-serif;
    background: var(--cream);
    color: var(--navy);
  }

  .page {
    display: grid;
    grid-template-columns: 1fr 320px;
    min-height: 100vh;
  }

  /* LEFT CONTENT */
  .content {
    padding: 80px 70px;
    background: var(--cream);
  }

  h1 {
    font-size: 72px;
    font-weight: 900;
    color: var(--navy);
    letter-spacing: -1px;
    line-height: 1;
  }

  .company-name {
    margin-top: 12px;
    font-size: 16px;
    font-weight: 600;
    color: var(--navy);
  }

  .customer-info {
    margin-top: 60px;
    padding: 25px;
    background: #ffffff;
    border-radius: 8px;
  }

  .customer-info h3 {
    font-size: 12px;
    letter-spacing: 1px;
    margin-bottom: 10px;
    text-transform: uppercase;
    color: var(--navy);
    font-weight: 700;
  }

  .customer-info p {
    font-size: 14px;
    margin: 4px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 50px;
  }

  th {
    text-align: left;
    font-size: 12px;
    letter-spacing: 1px;
    padding-bottom: 12px;
    border-bottom: 3px solid var(--navy);
    text-transform: uppercase;
    font-weight: 700;
    color: var(--navy);
  }

  th.num, td.num {
    text-align: right;
  }

  td {
    padding: 18px 0;
    font-size: 14px;
    border-bottom: 1px solid var(--light-gray);
  }

  .item-col {
    width: 50%;
  }

  .summary {
    margin-top: 50px;
    max-width: 350px;
    margin-left: auto;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    font-size: 14px;
  }

  .summary-row.total {
    font-weight: 800;
    font-size: 18px;
    border-top: 3px solid var(--navy);
    margin-top: 14px;
    padding-top: 14px;
  }

  .thank-you {
    margin-top: 60px;
    font-weight: 800;
    font-size: 20px;
  }

  /* SIDEBAR */
  .sidebar {
    background: var(--sand);
    padding: 70px 35px;
  }

  .sidebar .date {
    font-weight: 800;
    font-size: 16px;
    margin-bottom: 40px;
  }

  .sidebar h3 {
    font-size: 12px;
    letter-spacing: 1.5px;
    margin: 30px 0 8px;
    text-transform: uppercase;
    font-weight: 700;
  }

  .sidebar p {
    font-size: 14px;
    margin: 4px 0;
  }

  .payment-info {
    background: #ffffff;
    padding: 20px;
    border-radius: 8px;
    margin-top: 25px;
  }

  /* FOOTER */
  footer {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 2fr 1fr;
  }

  .footer-left {
    background: var(--sand);
    padding: 40px 70px;
    display: flex;
    align-items: center;
    gap: 25px;
  }

  .logo-container {
    width: 100px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gold);
    color: var(--navy);
    font-weight: 900;
    font-size: 20px;
    border-radius: 6px;
  }

  .logo-container img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .footer-info strong {
    display: block;
    font-size: 15px;
    margin-bottom: 4px;
  }

  .footer-info p {
    font-size: 12px;
    margin: 2px 0;
  }

  .footer-pattern {
    background-color: var(--gold);
    background-image:
      linear-gradient(60deg, rgba(0,0,0,0.05) 25%, transparent 25%),
      linear-gradient(-60deg, rgba(0,0,0,0.05) 25%, transparent 25%);
    background-size: 20px 35px;
  }

</style>
</head>

<body>
<div class="page">

  <div class="content">
    <h1>Invoice</h1>
    <div class="company-name">${company.name || "Oweru International LTD"}</div>

    ${
      invoice.customerId
        ? `
    <div class="customer-info">
      <h3>Bill To</h3>
      <p><strong>${invoice.customerId.name || "N/A"}</strong></p>
      ${invoice.customerId.phone ? `<p>Phone: ${invoice.customerId.phone}</p>` : ""}
      ${invoice.customerId.email ? `<p>Email: ${invoice.customerId.email}</p>` : ""}
      ${invoice.customerId.address ? `<p>Address: ${invoice.customerId.address}</p>` : ""}
    </div>`
        : ""
    }

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
            <td class="item-col"><strong>${it.serviceName}</strong></td>
            <td class="num">${it.quantity}</td>
            <td class="num">${formatTZS(it.unitPrice)}</td>
            <td class="num">${formatTZS(it.totalPrice)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>${formatTZS(invoice.subtotal)}</span>
      </div>

      ${
        invoice.discount > 0
          ? `<div class="summary-row">
              <span>Discount</span>
              <span>${formatTZS(invoice.discount)}</span>
            </div>`
          : ""
      }

      <div class="summary-row total">
        <span>Total</span>
        <span>${formatTZS(invoice.total)}</span>
      </div>
    </div>

    <div class="thank-you">Thank you!</div>
  </div>

  <aside class="sidebar">
    <div class="date">${invoiceDate}</div>

    <h3>Invoice</h3>
    <p>#${invoiceNumber}</p>

    <h3>Status</h3>
    <p>${invoice.paymentStatus || "UNPAID"}</p>

    <h3>Due Date</h3>
    <p>${dueDate}</p>

    <div class="payment-info">
      <h3 style="margin-top:0;">Payment</h3>
      <p><strong>${company.bankName || "Any Bank"}</strong></p>
      <p>Account: ${company.accountName || company.name || "Oweru International LTD"}</p>
      <p>Number: ${company.accountNumber || "123456789"}</p>
    </div>
  </aside>

  <footer>
    <div class="footer-left">
      ${
        company.logo
          ? `<div class="logo-container"><img src="${company.logo}" /></div>`
          : `<div class="logo-container">OW</div>`
      }

      <div class="footer-info">
        <strong>${company.name || "Oweru International LTD"}</strong>
        <p>${company.phone || "+255 711 890 764"}</p>
        <p>${company.email || "info@oweru.com"}</p>
        <p>${company.address || "Tancot House, Posta - Dar es Salaam, Tanzania"}</p>
        ${company.pobox ? `<p>${company.pobox}</p>` : ""}
        ${company.website ? `<p>${company.website}</p>` : ""}
      </div>
    </div>

    <div class="footer-pattern"></div>
  </footer>

</div>
</body>
</html>
`;
};