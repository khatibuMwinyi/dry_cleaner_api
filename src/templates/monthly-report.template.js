export const monthlyReportTemplate = (reportData, company = {}) => {
  const formatTZS = (amount) =>
    new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
  };

  const { period, summary, revenueBreakdown, expenseBreakdown, allInvoices, allExpenses } = reportData;

  // Generate chart data as simple text representation
  const generateExpenseChart = () => {
    const total = summary.totalExpenses;
    if (total === 0) return '<div class="no-data">No expenses this period</div>';
    
    return expenseBreakdown.map(category => {
      const percentage = ((category.total / total) * 100).toFixed(1);
      return `
        <div class="chart-item">
          <div class="chart-bar">
            <div class="chart-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="chart-label">
            <span class="category-name">${category.category}</span>
            <span class="chart-value">${formatTZS(category.total)} (${percentage}%)</span>
          </div>
        </div>
      `;
    }).join('');
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Monthly Financial Report - ${period.month}</title>

<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
    background: #fff;
  }

  .page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 30px;
  }

  .header {
    text-align: center;
    margin-bottom: 40px;
    border-bottom: 3px solid #d4a24c;
    padding-bottom: 20px;
  }

  .header h1 {
    font-size: 36px;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 10px;
  }

  .header .period {
    font-size: 18px;
    color: #666;
    font-weight: 600;
  }

  .company-name {
    font-size: 16px;
    margin-top: 10px;
    color: #0F172A;
    font-weight: 600;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  .summary-card {
    background: #f8f9fa;
    padding: 25px;
    border-radius: 12px;
    text-align: center;
    border-left: 4px solid #d4a24c;
  }

  .summary-card.profit {
    background: #e8f5e8;
    border-left-color: #10b981;
  }

  .summary-card.loss {
    background: #fee2e2;
    border-left-color: #ef4444;
  }

  .summary-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #666;
    margin-bottom: 8px;
    font-weight: 600;
  }

  .summary-value {
    font-size: 28px;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 5px;
  }

  .summary-detail {
    font-size: 14px;
    color: #666;
  }

  .section {
    margin-bottom: 40px;
  }

  .section-title {
    font-size: 24px;
    font-weight: 700;
    color: #0F172A;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #e5e7eb;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
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
    background: #f8f9fa;
  }

  th.num {
    text-align: right;
  }

  td {
    padding: 12px 8px;
    font-size: 13px;
    vertical-align: top;
    border-bottom: 1px solid #f3f4f6;
    color: #111;
  }

  td.num {
    text-align: right;
    white-space: nowrap;
    font-weight: 600;
  }

  .two-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  .chart-container {
    background: #f8f9fa;
    padding: 25px;
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .chart-title {
    font-size: 16px;
    font-weight: 600;
    color: #0F172A;
    margin-bottom: 20px;
  }

  .chart-item {
    margin-bottom: 15px;
  }

  .chart-bar {
    background: #e5e7eb;
    height: 8px;
    border-radius: 4px;
    margin-bottom: 8px;
    overflow: hidden;
  }

  .chart-fill {
    background: linear-gradient(90deg, #d4a24c, #b8860b);
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .chart-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }

  .category-name {
    font-weight: 600;
    color: #0F172A;
  }

  .chart-value {
    color: #666;
  }

  .no-data {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 20px;
  }

  .detail-table {
    font-size: 12px;
  }

  .detail-table th {
    font-size: 11px;
  }

  .detail-table td {
    padding: 8px 6px;
    font-size: 11px;
  }

  .page-break {
    page-break-before: always;
    margin-top: 40px;
  }

  .footer {
    margin-top: 60px;
    padding-top: 30px;
    border-top: 2px solid #e5e7eb;
    text-align: center;
    color: #666;
    font-size: 12px;
  }

  .generated-at {
    margin-top: 10px;
  }

  @media print {
    .page {
      margin: 0;
      padding: 20px 15px;
    }
    
    .page-break {
      page-break-before: always;
    }
  }
</style>
</head>

<body>
<div class="page">

  <div class="header">
    <h1>Monthly Financial Report</h1>
    <div class="period">${period.month}</div>
    <div class="company-name">${company.name || "Oweru International LTD"}</div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-label">Total Revenue</div>
      <div class="summary-value">${formatTZS(summary.totalRevenue)}</div>
      <div class="summary-detail">${summary.invoiceCount} invoices</div>
    </div>
    
    <div class="summary-card">
      <div class="summary-label">Total Expenses</div>
      <div class="summary-value">${formatTZS(summary.totalExpenses)}</div>
      <div class="summary-detail">${summary.expenseCount} expenses</div>
    </div>
    
    <div class="summary-card ${summary.profit >= 0 ? 'profit' : 'loss'}">
      <div class="summary-label">${summary.profit >= 0 ? 'Net Profit' : 'Net Loss'}</div>
      <div class="summary-value">${formatTZS(Math.abs(summary.profit))}</div>
      <div class="summary-detail">Margin: ${summary.profitMargin}%</div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Revenue vs Expenses Overview</h2>
    <div class="two-column">
      <div class="chart-container">
        <div class="chart-title">Expense Breakdown by Category</div>
        ${generateExpenseChart()}
      </div>
      
      <div class="chart-container">
        <div class="chart-title">Revenue by Customer (Top 10)</div>
        ${revenueBreakdown.slice(0, 10).length > 0 ? revenueBreakdown.slice(0, 10).map(customer => {
          const percentage = summary.totalRevenue > 0 ? ((customer.total / summary.totalRevenue) * 100).toFixed(1) : 0;
          return `
            <div class="chart-item">
              <div class="chart-bar">
                <div class="chart-fill" style="width: ${percentage}%"></div>
              </div>
              <div class="chart-label">
                <span class="category-name">${customer.customerName}</span>
                <span class="chart-value">${formatTZS(customer.total)} (${percentage}%)</span>
              </div>
            </div>
          `;
        }).join('') : '<div class="no-data">No revenue this period</div>'}
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Detailed Revenue Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Customer Name</th>
          <th>Phone</th>
          <th class="num">Invoices</th>
          <th class="num">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${revenueBreakdown.length > 0 ? revenueBreakdown.map(customer => `
          <tr>
            <td><strong>${customer.customerName}</strong></td>
            <td>${customer.customerPhone || 'N/A'}</td>
            <td class="num">${customer.invoiceCount}</td>
            <td class="num">${formatTZS(customer.total)}</td>
          </tr>
        `).join('') : '<tr><td colspan="4" class="no-data">No revenue data available</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">Detailed Expense Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th class="num">Items Count</th>
          <th class="num">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${expenseBreakdown.length > 0 ? expenseBreakdown.map(category => `
          <tr>
            <td><strong>${category.category}</strong></td>
            <td class="num">${category.items.length}</td>
            <td class="num">${formatTZS(category.total)}</td>
          </tr>
        `).join('') : '<tr><td colspan="3" class="no-data">No expense data available</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="page-break">
    <div class="section">
      <h2 class="section-title">All Invoices</h2>
      <table class="detail-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Date</th>
            <th class="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${allInvoices.length > 0 ? allInvoices.map(invoice => `
            <tr>
              <td>${invoice.invoiceNumber || invoice._id.toString().slice(-6)}</td>
              <td>${invoice.customerName}</td>
              <td>${formatDate(invoice.paidAt || invoice.createdAt)}</td>
              <td class="num">${formatTZS(invoice.total)}</td>
            </tr>
          `).join('') : '<tr><td colspan="4" class="no-data">No invoices found</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">All Expenses</h2>
    <table class="detail-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Inventory Used</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${allExpenses.length > 0 ? allExpenses.map(expense => {
          const inventoryList = expense.inventoryUsageDetails && expense.inventoryUsageDetails.length > 0 
            ? expense.inventoryUsage.map(iu => {
                const inv = expense.inventoryUsageDetails.find(i => i._id.toString() === iu.inventory?.toString());
                return inv ? `${inv.name}: ${iu.quantityUsed} ${inv.unit || ''}` : null;
              }).filter(Boolean).join(', ')
            : '-';
          return `
          <tr>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.category || 'Other'}</td>
            <td>${inventoryList}</td>
            <td class="num">${formatTZS(expense.amount)}</td>
          </tr>
        `}).join('') : '<tr><td colspan="4" class="no-data">No expenses found</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div>${company.name || "Oweru International LTD"}</div>
    <div class="generated-at">Report generated on ${formatDate(new Date())}</div>
  </div>

</div>
</body>
</html>
  `;
};