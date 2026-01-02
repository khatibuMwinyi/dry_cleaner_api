import Invoice from "../models/Invoice.js";
import Expense from "../models/Expense.js";
import Customer from "../models/Customer.js";

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

