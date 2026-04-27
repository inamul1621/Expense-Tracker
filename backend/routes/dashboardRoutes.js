const express = require('express');
const {
  getSummary,
  getMonthlyAnalytics,
  getCategoryBreakdown,
  getRecentTransactions,
  getBudgetAlerts,
  getPrediction,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', protect, getSummary);
router.get('/monthly-analytics', protect, getMonthlyAnalytics);
router.get('/category-breakdown', protect, getCategoryBreakdown);
router.get('/recent', protect, getRecentTransactions);
router.get('/budget-alerts', protect, getBudgetAlerts);
router.get('/prediction', protect, getPrediction);

module.exports = router;

