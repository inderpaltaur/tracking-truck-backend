import Transaction from '../models/Transaction.js';
import Purchase from '../models/Purchase.js';
import Sale from '../models/Sale.js';
import Trailer from '../models/Trailer.js';
import Task from '../models/Task.js';
import Agreement from '../models/Agreement.js';
import Call from '../models/Call.js';

// @desc    Get staff performance report
// @route   GET /api/reports/staff
// @access  Private
const getStaffReport = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    let dateFilter = {};
    if (dateFrom && dateTo) {
      dateFilter.date = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo)
      };
    }

    const Staff = (await import('../models/Staff.js')).default;
    const staff = await Staff.find();
    const report = await Promise.all(
      staff.map(async (s) => {
        const transactions = await Transaction.find({
          staff: s._id,
          ...dateFilter
        });

        const revenue = transactions
          .filter(t => t.type === 'revenue')
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        // Count tasks assigned to this staff
        const tasksCount = await Task.countDocuments({
          assignedTo: s._id,
          ...(dateFrom && dateTo ? createdAtFilter : {})
        });

        // Count agreements for this staff
        const agreementsCount = await Agreement.countDocuments({
          staff: s._id,
          ...(dateFrom && dateTo ? createdAtFilter : {})
        });

        // Count calls for this staff
        const callsCount = await Call.countDocuments({
          staff: s._id,
          ...(dateFrom && dateTo ? callDateFilter : {})
        });

        return {
          staff: s.name,
          department: s.department,
          revenue,
          expenses,
          profit: revenue - expenses,
          tasks: tasksCount,
          calls: callsCount,
          agreements: agreementsCount
        };
      })
    );

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get financial report
// @route   GET /api/reports/financial
// @access  Private
const getFinancialReport = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    let dateFilter = {};
    let createdAtFilter = {};
    let callDateFilter = {};
    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      dateFilter.date = { $gte: fromDate, $lte: toDate };
      createdAtFilter.createdAt = { $gte: fromDate, $lte: toDate };
      callDateFilter.callDate = { $gte: fromDate, $lte: toDate };
    }

    const revenueResult = await Transaction.aggregate([
      { $match: { type: 'revenue', ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const expenseResult = await Transaction.aggregate([
      { $match: { type: 'expense', ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      revenue: revenueResult[0]?.total || 0,
      expenses: expenseResult[0]?.total || 0,
      profit: (revenueResult[0]?.total || 0) - (expenseResult[0]?.total || 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get profit/loss report
// @route   GET /api/reports/profit-loss
// @access  Private
const getProfitLossReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Get revenue from sales
    const sales = await Sale.find(dateFilter);
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Get revenue from transactions
    const revenueTransactions = await Transaction.find({
      ...dateFilter,
      type: 'revenue'
    });
    const transactionRevenue = revenueTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Get expenses from purchases
    const purchases = await Purchase.find(dateFilter);
    const totalExpenses = purchases.reduce((sum, purchase) => {
      return sum + (purchase.type === 'expense' ? purchase.amount : purchase.totalCost);
    }, 0);

    // Get expenses from transactions
    const expenseTransactions = await Transaction.find({
      ...dateFilter,
      type: 'expense'
    });
    const transactionExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    const totalRevenueAll = totalRevenue + transactionRevenue;
    const totalExpensesAll = totalExpenses + transactionExpenses;
    const netProfit = totalRevenueAll - totalExpensesAll;
    const profitMargin = totalRevenueAll > 0 ? (netProfit / totalRevenueAll) * 100 : 0;

    res.json({
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      },
      revenue: {
        sales: totalRevenue,
        transactions: transactionRevenue,
        total: totalRevenueAll
      },
      expenses: {
        purchases: totalExpenses,
        transactions: transactionExpenses,
        total: totalExpensesAll
      },
      profit: {
        net: netProfit,
        margin: profitMargin
      },
      summary: {
        totalTransactions: sales.length + purchases.length + revenueTransactions.length + expenseTransactions.length,
        salesCount: sales.length,
        purchasesCount: purchases.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get monthly revenue data for charts
// @route   GET /api/reports/monthly-revenue
// @access  Private
const getMonthlyRevenue = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Get monthly sales data
    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(targetYear, month, 1);
      const endDate = new Date(targetYear, month + 1, 0, 23, 59, 59);

      // Sales revenue
      const sales = await Sale.find({
        date: { $gte: startDate, $lte: endDate }
      });
      const salesRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

      // Transaction revenue
      const revenueTransactions = await Transaction.find({
        date: { $gte: startDate, $lte: endDate },
        type: 'revenue'
      });
      const transactionRevenue = revenueTransactions.reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        month: startDate.toLocaleString('default', { month: 'short' }),
        sales: salesRevenue,
        transactions: transactionRevenue,
        total: salesRevenue + transactionRevenue
      });
    }

    res.json({
      year: targetYear,
      data: monthlyData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get trailer dashboard data
// @route   GET /api/reports/trailer-dashboard
// @access  Private
const getTrailerDashboard = async (req, res) => {
  try {
    const trailers = await Trailer.find();

    const stats = {
      total: trailers.length,
      available: trailers.filter(t => t.status === 'active').length,
      leased: trailers.filter(t => t.status === 'leased').length,
      maintenance: trailers.filter(t => t.status === 'maintenance').length,
      totalValue: trailers.reduce((sum, t) => sum + t.value, 0),
      monthlyRevenue: 0 // This would need lease/rental data
    };

    // Calculate utilization rate
    stats.utilizationRate = stats.total > 0 ? Math.round((stats.leased / stats.total) * 100) : 0;

    res.json({
      totalTrailers: stats.total,
      availableTrailers: stats.available,
      leasedTrailers: stats.leased,
      maintenanceTrailers: stats.maintenance,
      totalValue: stats.totalValue,
      monthlyRevenue: stats.monthlyRevenue,
      utilizationRate: stats.utilizationRate,
      trailers: trailers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getStaffReport,
  getFinancialReport,
  getProfitLossReport,
  getMonthlyRevenue,
  getTrailerDashboard
};