import Invoice from "../models/Invoice.js";
import Expense from "../models/Expense.js";
import Customer from "../models/Customer.js";
import { generatePdfFromMonthlyReport, generatePdfFromWeeklyReport, generatePdfFromDailyReport } from "../utils/pdf.js";

// Get revenue and expense analytics
export const getFinancialAnalytics = async (req, res) => {
  try {
    const { period = "month", startDate, endDate } = req.query;

    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      const now = new Date();
      if (period === "week") {
        start = new Date(now.setDate(now.getDate() - 7));
        end = new Date();
      } else if (period === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
      } else if (period === "year") {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date();
      } else {
        start = new Date(0);
        end = new Date();
      }
    }

    // Revenue from paid invoices (use paidAt if available, otherwise createdAt for paid invoices)
    const revenueData = await Invoice.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          $or: [
            { paidAt: { $gte: start, $lte: end } },
            { $and: [{ paidAt: null }, { createdAt: { $gte: start, $lte: end } }] }
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          invoiceCount: { $sum: 1 },
        },
      },
    ]);

    // Expenses
    const expenseData = await Expense.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" },
          expenseCount: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const totalExpenses = expenseData[0]?.totalExpenses || 0;
    const profit = totalRevenue - totalExpenses;

    res.json({
      period: { start, end },
      revenue: {
        total: totalRevenue,
        invoiceCount: revenueData[0]?.invoiceCount || 0,
      },
      expenses: {
        total: totalExpenses,
        expenseCount: expenseData[0]?.expenseCount || 0,
      },
      profit,
      profitMargin: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : 0,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get daily revenue and expenses
export const getDailyAnalytics = async (req, res) => {
  try {
    const days = [];
    const now = new Date();
    
    // Get last 30 days
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const revenueData = await Invoice.aggregate([
        {
          $match: {
            paymentStatus: "PAID",
            $or: [
              { paidAt: { $gte: dayStart, $lte: dayEnd } },
              { $and: [{ paidAt: null }, { createdAt: { $gte: dayStart, $lte: dayEnd } }] }
            ],
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]);

      const expenseData = await Expense.aggregate([
        {
          $match: {
            date: { $gte: dayStart, $lte: dayEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      const monthName = dayStart.toLocaleString("default", { month: "short" });
      const dayNumber = dayStart.getDate();
      
      days.push({
        date: dayStart,
        day: `${dayNumber} ${monthName}`,
        month: dayStart.toLocaleString("default", { month: "long", year: "numeric" }),
        revenue: revenueData[0]?.total || 0,
        expenses: expenseData[0]?.total || 0,
        profit: (revenueData[0]?.total || 0) - (expenseData[0]?.total || 0),
      });
    }

    res.json(days);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get monthly revenue and expenses
export const getMonthlyAnalytics = async (req, res) => {
  try {
    const months = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

      const revenueData = await Invoice.aggregate([
        {
          $match: {
            paymentStatus: "PAID",
            $or: [
              { paidAt: { $gte: monthStart, $lte: monthEnd } },
              { $and: [{ paidAt: null }, { createdAt: { $gte: monthStart, $lte: monthEnd } }] }
            ],
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]);

      const expenseData = await Expense.aggregate([
        {
          $match: {
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      months.unshift({
        month: monthStart.toLocaleString("default", { month: "long", year: "numeric" }),
        startDate: monthStart,
        endDate: monthEnd,
        revenue: revenueData[0]?.total || 0,
        expenses: expenseData[0]?.total || 0,
        profit: (revenueData[0]?.total || 0) - (expenseData[0]?.total || 0),
      });
    }

    res.json(months);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get top customers by spending
export const getTopCustomers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topCustomers = await Invoice.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
        },
      },
      {
        $group: {
          _id: "$customerId",
          totalSpent: { $sum: "$total" },
          invoiceCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $project: {
          customerId: "$_id",
          customerName: "$customer.name",
          customerPhone: "$customer.phone",
          customerEmail: "$customer.email",
          totalSpent: 1,
          invoiceCount: 1,
        },
      },
    ]);

    res.json(topCustomers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Generate monthly revenue vs expenses PDF report data
export const getMonthlyReportData = async (req, res) => {
  try {
    const { year, month } = req.body;
    
    if (!year || !month) {
      return res.status(400).json({ message: "Year and month are required" });
    }

    // Create date range for the specified month
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    
    // Get revenue data with customer details
    const revenueData = await Invoice.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          $or: [
            { paidAt: { $gte: monthStart, $lte: monthEnd } },
            { $and: [{ paidAt: null }, { createdAt: { $gte: monthStart, $lte: monthEnd } }] }
          ],
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $project: {
          invoiceNumber: "$invoiceNumber",
          total: "$total",
          createdAt: "$createdAt",
          paidAt: "$paidAt",
          customerName: "$customer.name",
          customerPhone: "$customer.phone",
          items: "$items"
        },
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    // Get expense data with category breakdown
    const expenseData = await Expense.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $sort: { date: -1 }
      }
    ]);

    // Calculate totals
    const totalRevenue = revenueData.reduce((sum, inv) => sum + inv.total, 0);
    const totalExpenses = expenseData.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = totalRevenue - totalExpenses;

    // Group expenses by category
    const expensesByCategory = expenseData.reduce((acc, expense) => {
      const category = expense.category || "Other";
      if (!acc[category]) {
        acc[category] = {
          category,
          total: 0,
          items: []
        };
      }
      acc[category].total += expense.amount;
      acc[category].items.push(expense);
      return acc;
    }, {});

    // Group revenue by customer
    const revenueByCustomer = revenueData.reduce((acc, invoice) => {
      const customerName = invoice.customerName || "Unknown Customer";
      if (!acc[customerName]) {
        acc[customerName] = {
          customerName,
          customerPhone: invoice.customerPhone,
          total: 0,
          invoiceCount: 0,
          invoices: []
        };
      }
      acc[customerName].total += invoice.total;
      acc[customerName].invoiceCount += 1;
      acc[customerName].invoices.push(invoice);
      return acc;
    }, {});

    const monthName = monthStart.toLocaleString("default", { month: "long", year: "numeric" });

    res.json({
      period: {
        year,
        month: monthName,
        startDate: monthStart,
        endDate: monthEnd
      },
      summary: {
        totalRevenue,
        totalExpenses,
        profit,
        profitMargin: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : 0,
        invoiceCount: revenueData.length,
        expenseCount: expenseData.length
      },
      revenueBreakdown: Object.values(revenueByCustomer),
      expenseBreakdown: Object.values(expensesByCategory),
      allInvoices: revenueData,
      allExpenses: expenseData
    });
  } catch (error) {
    console.error("Error generating monthly report data:", error);
    res.status(400).json({ message: error.message });
  }
};

// Generate and download monthly PDF report
export const generateMonthlyReportPDF = async (req, res) => {
  try {
    const { year, month } = req.body;
    
    if (!year || !month) {
      return res.status(400).json({ message: "Year and month are required" });
    }

    // Create date range for the specified month
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    
    // Get revenue data with customer details
    const revenueData = await Invoice.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          $or: [
            { paidAt: { $gte: monthStart, $lte: monthEnd } },
            { $and: [{ paidAt: null }, { createdAt: { $gte: monthStart, $lte: monthEnd } }] }
          ],
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $project: {
          invoiceNumber: "$invoiceNumber",
          total: "$total",
          createdAt: "$createdAt",
          paidAt: "$paidAt",
          customerName: "$customer.name",
          customerPhone: "$customer.phone",
          items: "$items"
        },
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    // Get expense data with category breakdown
    const expenseData = await Expense.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $sort: { date: -1 }
      }
    ]);

    // Calculate totals
    const totalRevenue = revenueData.reduce((sum, inv) => sum + inv.total, 0);
    const totalExpenses = expenseData.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = totalRevenue - totalExpenses;

    // Group expenses by category
    const expensesByCategory = expenseData.reduce((acc, expense) => {
      const category = expense.category || "Other";
      if (!acc[category]) {
        acc[category] = {
          category,
          total: 0,
          items: []
        };
      }
      acc[category].total += expense.amount;
      acc[category].items.push(expense);
      return acc;
    }, {});

    // Group revenue by customer
    const revenueByCustomer = revenueData.reduce((acc, invoice) => {
      const customerName = invoice.customerName || "Unknown Customer";
      if (!acc[customerName]) {
        acc[customerName] = {
          customerName,
          customerPhone: invoice.customerPhone,
          total: 0,
          invoiceCount: 0,
          invoices: []
        };
      }
      acc[customerName].total += invoice.total;
      acc[customerName].invoiceCount += 1;
      acc[customerName].invoices.push(invoice);
      return acc;
    }, {});

    const monthName = monthStart.toLocaleString("default", { month: "long", year: "numeric" });

    const reportData = {
      period: {
        year,
        month: monthName,
        startDate: monthStart,
        endDate: monthEnd
      },
      summary: {
        totalRevenue,
        totalExpenses,
        profit,
        profitMargin: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : 0,
        invoiceCount: revenueData.length,
        expenseCount: expenseData.length
      },
      revenueBreakdown: Object.values(revenueByCustomer),
      expenseBreakdown: Object.values(expensesByCategory),
      allInvoices: revenueData,
      allExpenses: expenseData
    };

    // Company settings (you can extend this to fetch from database)
    const company = {
      name: "Oweru International LTD",
      phone: "+255 711 890 764",
      email: "info@oweru.com",
      address: "Tancot House, Posta - Dar es Salaam, Tanzania"
    };

    // Generate PDF
    const pdfBuffer = await generatePdfFromMonthlyReport(reportData, company);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Monthly-Report-${monthName.replace(/[\s,]/g, '-')}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF buffer
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("Error generating monthly report PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF: " + error.message });
  }
};

// Get customer expenses (spending history)
export const getCustomerExpenses = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { customerId, paymentStatus: "PAID" };

    // For date filtering, use paidAt if available, otherwise createdAt
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      
      query.$or = [
        { paidAt: dateFilter },
        { $and: [{ paidAt: null }, { createdAt: dateFilter }] }
      ];
    }

    const invoices = await Invoice.find(query)
      .sort({ paidAt: -1, createdAt: -1 })
      .populate("customerId", "name phone email");

    const totalSpent = invoices.reduce((sum, inv) => sum + inv.total, 0);

    res.json({
      customer: invoices[0]?.customerId || null,
      invoices,
      totalSpent,
      invoiceCount: invoices.length,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get weekly report data
export const getWeeklyReportData = async (req, res) => {
  try {
    const { year, month, weekNumber } = req.body;
    
    if (!year || !month || !weekNumber) {
      return res.status(400).json({ message: "Year, month, and week number are required" });
    }

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    
    let weekStart, weekEnd;
    switch (weekNumber) {
      case 1:
        weekStart = new Date(year, month - 1, 1);
        weekEnd = new Date(year, month - 1, 7, 23, 59, 59, 999);
        break;
      case 2:
        weekStart = new Date(year, month - 1, 8);
        weekEnd = new Date(year, month - 1, 14, 23, 59, 59, 999);
        break;
      case 3:
        weekStart = new Date(year, month - 1, 15);
        weekEnd = new Date(year, month - 1, 21, 23, 59, 59, 999);
        break;
      case 4:
        weekStart = new Date(year, month - 1, 22);
        weekEnd = new Date(monthEnd);
        break;
      default:
        return res.status(400).json({ message: "Week number must be 1-4" });
    }

    const revenueData = await Invoice.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          $or: [
            { paidAt: { $gte: weekStart, $lte: weekEnd } },
            { $and: [{ paidAt: null }, { createdAt: { $gte: weekStart, $lte: weekEnd } }] }
          ],
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $project: {
          invoiceNumber: "$invoiceNumber",
          total: "$total",
          createdAt: "$createdAt",
          paidAt: "$paidAt",
          customerName: "$customer.name",
          customerPhone: "$customer.phone",
          items: "$items"
        },
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    const expenseData = await Expense.aggregate([
      {
        $match: {
          date: { $gte: weekStart, $lte: weekEnd },
        },
      },
      {
        $sort: { date: -1 }
      },
      {
        $lookup: {
          from: "inventories",
          localField: "inventoryUsage.inventory",
          foreignField: "_id",
          as: "inventoryUsageDetails"
        }
      }
    ]);

    const totalRevenue = revenueData.reduce((sum, inv) => sum + inv.total, 0);
    const totalExpenses = expenseData.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = totalRevenue - totalExpenses;

    const expensesByCategory = expenseData.reduce((acc, expense) => {
      const category = expense.category || "Other";
      if (!acc[category]) {
        acc[category] = {
          category,
          total: 0,
          items: []
        };
      }
      acc[category].total += expense.amount;
      acc[category].items.push(expense);
      return acc;
    }, {});

    const revenueByCustomer = revenueData.reduce((acc, invoice) => {
      const customerName = invoice.customerName || "Unknown Customer";
      if (!acc[customerName]) {
        acc[customerName] = {
          customerName,
          customerPhone: invoice.customerPhone,
          total: 0,
          invoiceCount: 0,
          invoices: []
        };
      }
      acc[customerName].total += invoice.total;
      acc[customerName].invoiceCount += 1;
      acc[customerName].invoices.push(invoice);
      return acc;
    }, {});

    const monthName = monthStart.toLocaleString("default", { month: "long", year: "numeric" });
    const formatDateRange = (start, end) => {
      const s = new Date(start);
      const e = new Date(end);
      return `${s.getDate()} - ${e.getDate()} ${e.toLocaleString("default", { month: "short" })}`;
    };

    res.json({
      period: {
        year,
        month: monthName,
        week: `Week ${weekNumber}`,
        dateRange: formatDateRange(weekStart, weekEnd),
        startDate: weekStart,
        endDate: weekEnd
      },
      summary: {
        totalRevenue,
        totalExpenses,
        profit,
        profitMargin: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : 0,
        invoiceCount: revenueData.length,
        expenseCount: expenseData.length
      },
      revenueBreakdown: Object.values(revenueByCustomer),
      expenseBreakdown: Object.values(expensesByCategory),
      allInvoices: revenueData,
      allExpenses: expenseData
    });
  } catch (error) {
    console.error("Error generating weekly report data:", error);
    res.status(400).json({ message: error.message });
  }
};

// Generate and download weekly PDF report
export const generateWeeklyReportPDF = async (req, res) => {
  try {
    const { year, month, weekNumber } = req.body;
    
    if (!year || !month || !weekNumber) {
      return res.status(400).json({ message: "Year, month, and week number are required" });
    }

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    
    let weekStart, weekEnd;
    switch (weekNumber) {
      case 1:
        weekStart = new Date(year, month - 1, 1);
        weekEnd = new Date(year, month - 1, 7, 23, 59, 59, 999);
        break;
      case 2:
        weekStart = new Date(year, month - 1, 8);
        weekEnd = new Date(year, month - 1, 14, 23, 59, 59, 999);
        break;
      case 3:
        weekStart = new Date(year, month - 1, 15);
        weekEnd = new Date(year, month - 1, 21, 23, 59, 59, 999);
        break;
      case 4:
        weekStart = new Date(year, month - 1, 22);
        weekEnd = new Date(monthEnd);
        break;
      default:
        return res.status(400).json({ message: "Week number must be 1-4" });
    }

    const revenueData = await Invoice.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          $or: [
            { paidAt: { $gte: weekStart, $lte: weekEnd } },
            { $and: [{ paidAt: null }, { createdAt: { $gte: weekStart, $lte: weekEnd } }] }
          ],
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $project: {
          invoiceNumber: "$invoiceNumber",
          total: "$total",
          createdAt: "$createdAt",
          paidAt: "$paidAt",
          customerName: "$customer.name",
          customerPhone: "$customer.phone",
          items: "$items"
        },
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    const expenseData = await Expense.aggregate([
      {
        $match: {
          date: { $gte: weekStart, $lte: weekEnd },
        },
      },
      {
        $sort: { date: -1 }
      },
      {
        $lookup: {
          from: "inventories",
          localField: "inventoryUsage.inventory",
          foreignField: "_id",
          as: "inventoryUsageDetails"
        }
      }
    ]);

    const totalRevenue = revenueData.reduce((sum, inv) => sum + inv.total, 0);
    const totalExpenses = expenseData.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = totalRevenue - totalExpenses;

    const expensesByCategory = expenseData.reduce((acc, expense) => {
      const category = expense.category || "Other";
      if (!acc[category]) {
        acc[category] = {
          category,
          total: 0,
          items: []
        };
      }
      acc[category].total += expense.amount;
      acc[category].items.push(expense);
      return acc;
    }, {});

    const revenueByCustomer = revenueData.reduce((acc, invoice) => {
      const customerName = invoice.customerName || "Unknown Customer";
      if (!acc[customerName]) {
        acc[customerName] = {
          customerName,
          customerPhone: invoice.customerPhone,
          total: 0,
          invoiceCount: 0,
          invoices: []
        };
      }
      acc[customerName].total += invoice.total;
      acc[customerName].invoiceCount += 1;
      acc[customerName].invoices.push(invoice);
      return acc;
    }, {});

    const monthName = monthStart.toLocaleString("default", { month: "long", year: "numeric" });
    const formatDateRange = (start, end) => {
      const s = new Date(start);
      const e = new Date(end);
      return `${s.getDate()} - ${e.getDate()} ${e.toLocaleString("default", { month: "short" })}`;
    };

    const reportData = {
      period: {
        year,
        month: monthName,
        week: `Week ${weekNumber}`,
        dateRange: formatDateRange(weekStart, weekEnd),
        startDate: weekStart,
        endDate: weekEnd
      },
      summary: {
        totalRevenue,
        totalExpenses,
        profit,
        profitMargin: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : 0,
        invoiceCount: revenueData.length,
        expenseCount: expenseData.length
      },
      revenueBreakdown: Object.values(revenueByCustomer),
      expenseBreakdown: Object.values(expensesByCategory),
      allInvoices: revenueData,
      allExpenses: expenseData
    };

    const company = {
      name: "Oweru International LTD",
      phone: "+255 711 890 764",
      email: "info@oweru.com",
      address: "Tancot House, Posta - Dar es Salaam, Tanzania"
    };

    const pdfBuffer = await generatePdfFromWeeklyReport(reportData, company);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Weekly-Report-${monthName.replace(/[\s,]/g, '-')}-Week${weekNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("Error generating weekly report PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF: " + error.message });
  }
};

// Get daily report data
export const getDailyReportData = async (req, res) => {
  try {
    const { year, month, day } = req.body;
    
    if (!year || !month || !day) {
      return res.status(400).json({ message: "Year, month, and day are required" });
    }

    const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0);
    const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

    const revenueData = await Invoice.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          $or: [
            { paidAt: { $gte: dayStart, $lte: dayEnd } },
            { $and: [{ paidAt: null }, { createdAt: { $gte: dayStart, $lte: dayEnd } }] }
          ],
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $project: {
          invoiceNumber: "$invoiceNumber",
          total: "$total",
          createdAt: "$createdAt",
          paidAt: "$paidAt",
          customerName: "$customer.name",
          customerPhone: "$customer.phone",
          items: "$items"
        },
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    const expenseData = await Expense.aggregate([
      {
        $match: {
          date: { $gte: dayStart, $lte: dayEnd },
        },
      },
      {
        $sort: { date: -1 }
      },
      {
        $lookup: {
          from: "inventories",
          localField: "inventoryUsage.inventory",
          foreignField: "_id",
          as: "inventoryUsageDetails"
        }
      }
    ]);

    const totalRevenue = revenueData.reduce((sum, inv) => sum + inv.total, 0);
    const totalExpenses = expenseData.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = totalRevenue - totalExpenses;

    const expensesByCategory = expenseData.reduce((acc, expense) => {
      const category = expense.category || "Other";
      if (!acc[category]) {
        acc[category] = {
          category,
          total: 0,
          items: []
        };
      }
      acc[category].total += expense.amount;
      acc[category].items.push(expense);
      return acc;
    }, {});

    const revenueByCustomer = revenueData.reduce((acc, invoice) => {
      const customerName = invoice.customerName || "Unknown Customer";
      if (!acc[customerName]) {
        acc[customerName] = {
          customerName,
          customerPhone: invoice.customerPhone,
          total: 0,
          invoiceCount: 0,
          invoices: []
        };
      }
      acc[customerName].total += invoice.total;
      acc[customerName].invoiceCount += 1;
      acc[customerName].invoices.push(invoice);
      return acc;
    }, {});

    const monthName = dayStart.toLocaleString("default", { month: "long", year: "numeric" });
    const dateStr = `${dayStart.getDate()} ${dayStart.toLocaleString("default", { month: "short" })} ${dayStart.getFullYear()}`;

    res.json({
      period: {
        year,
        month: monthName,
        date: dateStr,
        startDate: dayStart,
        endDate: dayEnd
      },
      summary: {
        totalRevenue,
        totalExpenses,
        profit,
        profitMargin: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : 0,
        invoiceCount: revenueData.length,
        expenseCount: expenseData.length
      },
      revenueBreakdown: Object.values(revenueByCustomer),
      expenseBreakdown: Object.values(expensesByCategory),
      allInvoices: revenueData,
      allExpenses: expenseData
    });
  } catch (error) {
    console.error("Error generating daily report data:", error);
    res.status(400).json({ message: error.message });
  }
};

// Generate and download daily PDF report
export const generateDailyReportPDF = async (req, res) => {
  try {
    const { year, month, day } = req.body;
    
    if (!year || !month || !day) {
      return res.status(400).json({ message: "Year, month, and day are required" });
    }

    const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0);
    const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

    const revenueData = await Invoice.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
          $or: [
            { paidAt: { $gte: dayStart, $lte: dayEnd } },
            { $and: [{ paidAt: null }, { createdAt: { $gte: dayStart, $lte: dayEnd } }] }
          ],
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $project: {
          invoiceNumber: "$invoiceNumber",
          total: "$total",
          createdAt: "$createdAt",
          paidAt: "$paidAt",
          customerName: "$customer.name",
          customerPhone: "$customer.phone",
          items: "$items"
        },
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    const expenseData = await Expense.aggregate([
      {
        $match: {
          date: { $gte: dayStart, $lte: dayEnd },
        },
      },
      {
        $sort: { date: -1 }
      },
      {
        $lookup: {
          from: "inventories",
          localField: "inventoryUsage.inventory",
          foreignField: "_id",
          as: "inventoryUsageDetails"
        }
      }
    ]);

    const totalRevenue = revenueData.reduce((sum, inv) => sum + inv.total, 0);
    const totalExpenses = expenseData.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = totalRevenue - totalExpenses;

    const expensesByCategory = expenseData.reduce((acc, expense) => {
      const category = expense.category || "Other";
      if (!acc[category]) {
        acc[category] = {
          category,
          total: 0,
          items: []
        };
      }
      acc[category].total += expense.amount;
      acc[category].items.push(expense);
      return acc;
    }, {});

    const revenueByCustomer = revenueData.reduce((acc, invoice) => {
      const customerName = invoice.customerName || "Unknown Customer";
      if (!acc[customerName]) {
        acc[customerName] = {
          customerName,
          customerPhone: invoice.customerPhone,
          total: 0,
          invoiceCount: 0,
          invoices: []
        };
      }
      acc[customerName].total += invoice.total;
      acc[customerName].invoiceCount += 1;
      acc[customerName].invoices.push(invoice);
      return acc;
    }, {});

    const monthName = dayStart.toLocaleString("default", { month: "long", year: "numeric" });
    const dateStr = `${dayStart.getDate()} ${dayStart.toLocaleString("default", { month: "short" })} ${dayStart.getFullYear()}`;

    const reportData = {
      period: {
        year,
        month: monthName,
        date: dateStr,
        startDate: dayStart,
        endDate: dayEnd
      },
      summary: {
        totalRevenue,
        totalExpenses,
        profit,
        profitMargin: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : 0,
        invoiceCount: revenueData.length,
        expenseCount: expenseData.length
      },
      revenueBreakdown: Object.values(revenueByCustomer),
      expenseBreakdown: Object.values(expensesByCategory),
      allInvoices: revenueData,
      allExpenses: expenseData
    };

    const company = {
      name: "Oweru International LTD",
      phone: "+255 711 890 764",
      email: "info@oweru.com",
      address: "Tancot House, Posta - Dar es Salaam, Tanzania"
    };

    const pdfBuffer = await generatePdfFromDailyReport(reportData, company);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Daily-Report-${dateStr.replace(/[\s,]/g, '-')}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("Error generating daily report PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF: " + error.message });
  }
};

