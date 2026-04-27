const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const { suggestCategory } = require('../utils/categorySuggestion');

// @desc    Get all transactions for logged in user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = { user: req.user.id };

    if (type) query.type = type;
    if (category) query.category = category.toLowerCase();
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments(query);

    res.json({
      success: true,
      count: transactions.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let { amount, type, category, date, note } = req.body;

    // Auto-suggest category if not provided
    if (!category && note) {
      category = suggestCategory(note, type);
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      amount: Number(amount),
      type,
      category: category || (type === 'income' ? 'salary' : 'others'),
      date: date || Date.now(),
      note,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const { amount, type, category, date, note } = req.body;

    // Auto-suggest category if note changed and category not provided
    let finalCategory = category;
    if (!category && note && note !== transaction.note) {
      finalCategory = suggestCategory(note, type || transaction.type);
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        amount: amount !== undefined ? Number(amount) : transaction.amount,
        type: type || transaction.type,
        category: finalCategory || transaction.category,
        date: date || transaction.date,
        note: note !== undefined ? note : transaction.note,
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await Transaction.deleteOne({ _id: req.params.id });

    res.json({ success: true, message: 'Transaction removed', data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Suggest category based on text
// @route   GET /api/transactions/suggest-category
// @access  Private
const suggestCategoryEndpoint = async (req, res, next) => {
  try {
    const { text, type } = req.query;
    const category = suggestCategory(text, type || 'expense');
    res.json({ success: true, data: { text, type: type || 'expense', suggestedCategory: category } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  suggestCategoryEndpoint,
};

