const express = require('express');
const { body } = require('express-validator');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  suggestCategoryEndpoint,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getTransactions);
router.get('/suggest-category', protect, suggestCategoryEndpoint);
router.get('/:id', protect, getTransaction);
router.post(
  '/',
  protect,
  [
    body('amount', 'Amount is required and must be a number').isFloat({ min: 0.01 }),
    body('type', 'Type must be income or expense').isIn(['income', 'expense']),
    body('category', 'Category is required if note is empty')
      .optional()
      .isIn(['food', 'travel', 'bills', 'shopping', 'health', 'others', 'salary', 'freelance', 'investment', 'gift']),
  ],
  createTransaction
);
router.put(
  '/:id',
  protect,
  [
    body('amount', 'Amount must be a positive number').optional().isFloat({ min: 0.01 }),
    body('type', 'Type must be income or expense').optional().isIn(['income', 'expense']),
    body('category', 'Invalid category').optional().isIn(['food', 'travel', 'bills', 'shopping', 'health', 'others', 'salary', 'freelance', 'investment', 'gift']),
  ],
  updateTransaction
);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;

