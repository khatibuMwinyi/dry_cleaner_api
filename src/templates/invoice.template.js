export const invoiceTemplate = ({ invoice, company }) => {
  const total = invoice.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
      padding: 40px;
      font-size: 14px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
    }

    .company h2 {
      margin: 0;
      color: #1f2937;
    }

    .invoice-info {
      text-align: right;
    }

    .invoice-info p {
      margin: 4px 0;
    }

    .status {
      font-weight: bold;
      color: ${
        invoice.paymentStatus === "PAID" ? "#16a34a" : "#dc2626"
      };
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
    }

    table th {
      background: #f3f4f6;
      text-align: left;
      padding: 10px;
      border-bottom: 2px solid #e5e7eb;
    }

    table td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }

    .total {
      text-align: right;
      margin-top: 20px;
      font-size: 16px;
      font-weight: bold;
    }

    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>

<body>

  <div class="header">
    <div class="company">
      <h2>${company.name}</h2>
      <p>Professional Dry Cleaning Services</p>
    </div>

    <div class="invoice-info">
      <p><strong>Invoice #</strong> ${invoice._id}</p>
      <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
      <p class="status">
        ${invoice.paymentStatus === "PAID" ? "PAID ✅" : "PENDING"}
      </p>
      ${
        invoice.paidAt
          ? `<p><strong>Paid At:</strong> ${new Date(invoice.paidAt).toLocaleDateString()}</p>`
          : ""
      }
    </div>
  </div>

  <hr />

  <p><strong>Billed To:</strong></p>
  <p>
    ${invoice.customerId.name}<br/>
    ${invoice.customerId.phone}<br/>
    ${invoice.customerId.email || ""}
  </p>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Service</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items
        .map(
          (item) => `
        <tr>
          <td>${item.itemName}</td>
          <td>${item.serviceName}</td>
          <td>${item.quantity}</td>
          <td>${item.price}</td>
          <td>${item.price * item.quantity}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="total">
    Total: ${total}
  </div>

  <div class="footer">
    Thank you for your business.
  </div>

</body>
</html>
`;
};
