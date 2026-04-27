const express = require('express');
const { body } = require('express-validator');
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getBudgets);
router.get('/:id', protect, getBudget);
router.post(
  '/',
  protect,
  [
    body('category', 'Category is required').not().isEmpty().trim().toLowerCase(),
    body('limit', 'Limit must be a positive number').isFloat({ min: 0.01 }),
    body('month', 'Month must be between 1 and 12').isInt({ min: 1, max: 12 }),
    body('year', 'Year is required').isInt({ min: 2000 }),
  ],
  createBudget
);
router.put(
  '/:id',
  protect,
  [
    body('limit', 'Limit must be a positive number').optional().isFloat({ min: 0.01 }),
  ],
  updateBudget
);
router.delete('/:id', protect, deleteBudget);

module.exports = router;

