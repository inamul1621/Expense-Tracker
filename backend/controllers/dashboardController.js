const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// Helper: get start and end of month
const getMonthBounds = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

// @desc    Get dashboard summary (total balance, monthly income/expense)
// @route   GET /api/dashboard/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const { start, end } = getMonthBounds(now.getFullYear(), now.getMonth() + 1);

    const transactions = await Transaction.find({
      user: req.user.id,
      date: { $gte: start, $lte: end },
    });

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Total balance (all time)
    const allTransactions = await Transaction.find({ user: req.user.id });
    const totalIncome = allTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = allTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      data: {
        totalBalance: totalIncome - totalExpense,
        totalIncome,
        totalExpense,
        monthlyIncome: income,
        monthlyExpense: expense,
        monthlySavings: income - expense,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly analytics data (bar chart)
// @route   GET /api/dashboard/monthly-analytics
// @access  Private
const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    const now = new Date();
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const { start, end } = getMonthBounds(d.getFullYear(), d.getMonth() + 1);

      const transactions = await Transaction.find({
        user: req.user.id,
        date: { $gte: start, $lte: end },
      });

      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        month: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        income: Math.round(income * 100) / 100,
        expense: Math.round(expense * 100) / 100,
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise breakdown (pie chart)
// @route   GET /api/dashboard/category-breakdown
// @access  Private
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { type = 'expense', year, month } = req.query;
    const now = new Date();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const { start, end } = getMonthBounds(targetYear, targetMonth);

    const breakdown = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const data = breakdown.map((item) => ({
      category: item._id,
      amount: Math.round(item.total * 100) / 100,
      count: item.count,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent transactions
// @route   GET /api/dashboard/recent
// @access  Private
const getRecentTransactions = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget alerts
// @route   GET /api/dashboard/budget-alerts
// @access  Private
const getBudgetAlerts = async (req, res, next) => {
  try {
    const now = new Date();
    const { start, end } = getMonthBounds(now.getFullYear(), now.getMonth() + 1);

    const budgets = await Budget.find({
      user: req.user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    const alerts = [];

    for (const budget of budgets) {
      const spent = await Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            type: 'expense',
            category: budget.category,
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      const totalSpent = spent.length > 0 ? spent[0].total : 0;
      const percentage = (totalSpent / budget.limit) * 100;

      if (percentage >= 80) {
        alerts.push({
          category: budget.category,
          limit: budget.limit,
          spent: Math.round(totalSpent * 100) / 100,
          percentage: Math.round(percentage * 100) / 100,
          status: percentage >= 100 ? 'exceeded' : 'warning',
        });
      }
    }

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense prediction
// @route   GET /api/dashboard/prediction
// @access  Private
const getPrediction = async (req, res, next) => {
  try {
    const now = new Date();
    const expenses = [];

    // Get last 6 months expenses
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const { start, end } = getMonthBounds(d.getFullYear(), d.getMonth() + 1);

      const result = await Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            type: 'expense',
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      expenses.push(result.length > 0 ? result[0].total : 0);
    }

    // Simple linear regression for prediction
    const n = expenses.length;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = expenses.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * expenses[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextMonthPrediction = slope * (n + 1) + intercept;

    // Simple moving average as fallback
    const avg = expenses.reduce((a, b) => a + b, 0) / n;

    // Use regression if reasonable, else average
    const prediction =
      nextMonthPrediction > 0 ? nextMonthPrediction : avg;

    res.json({
      success: true,
      data: {
        historical: expenses.map((amount, i) => ({
          month: new Date(now.getFullYear(), now.getMonth() - (5 - i), 1).toLocaleString('default', { month: 'short' }),
          amount: Math.round(amount * 100) / 100,
        })),
        predictedNextMonth: Math.round(prediction * 100) / 100,
        method: nextMonthPrediction > 0 ? 'linear_regression' : 'moving_average',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getMonthlyAnalytics,
  getCategoryBreakdown,
  getRecentTransactions,
  getBudgetAlerts,
  getPrediction,
};

