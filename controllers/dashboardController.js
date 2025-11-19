import Trailer from '../models/Trailer.js';
import Transaction from '../models/Transaction.js';
import Event from '../models/Event.js';

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const { dateFrom, dateTo, staff, type } = req.query;
    
    // Build filter for date range
    let dateFilter = {};
    if (dateFrom && dateTo) {
      dateFilter.date = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo)
      };
    }
    
    // Active trailers count
    const activeTrailers = await Trailer.countDocuments({ status: 'active' });
    
    // Calls today (events of type 'call' today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const callsToday = await Event.countDocuments({
      type: 'call',
      date: { $gte: today, $lt: tomorrow }
    });
    
    // Revenue and expenses for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const revenueResult = await Transaction.aggregate([
      {
        $match: {
          type: 'revenue',
          date: { $gte: startOfMonth, $lte: endOfMonth },
          ...dateFilter
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const expenseResult = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
          ...dateFilter
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const revenueMonth = revenueResult[0]?.total || 0;
    const expensesMonth = expenseResult[0]?.total || 0;
    
    // Monthly sales chart data (simplified)
    const monthlySales = [
      { month: 'Jan', sales: 12000 },
      { month: 'Feb', sales: 15000 },
      { month: 'Mar', sales: 18000 },
      { month: 'Apr', sales: 14000 },
      { month: 'May', sales: 20000 },
      { month: 'Jun', sales: 22000 }
    ];
    
    // Statistics chart data
    const statistics = [
      { name: 'Revenue', value: revenueMonth },
      { name: 'Expenses', value: expensesMonth },
      { name: 'Profit', value: revenueMonth - expensesMonth }
    ];
    
    // Demographic data (placeholder)
    const demographics = [
      { region: 'North', percentage: 35 },
      { region: 'South', percentage: 25 },
      { region: 'East', percentage: 20 },
      { region: 'West', percentage: 20 }
    ];
    
    // Monthly targets
    const monthlyTargets = [
      { month: 'Jan', target: 15000, achieved: 12000 },
      { month: 'Feb', target: 18000, achieved: 15000 },
      { month: 'Mar', target: 20000, achieved: 18000 }
    ];
    
    res.json({
      kpis: {
        activeTrailers,
        callsToday,
        revenueMonth,
        expensesMonth
      },
      charts: {
        monthlySales,
        statistics,
        demographics,
        monthlyTargets
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getDashboard
};