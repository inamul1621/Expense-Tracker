const { validationResult } = require('express-validator');
const Budget = require('../models/Budget');

// @desc    Get all budgets for user
// @route   GET /api/budget
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const query = { user: req.user.id };
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const budgets = await Budget.find(query).sort({ category: 1 });
    res.json({ success: true, count: budgets.length, data: budgets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single budget
// @route   GET /api/budget/:id
// @access  Private
const getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    res.json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budget
// @access  Private
const createBudget = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { category, limit, month, year } = req.body;

    const budget = await Budget.create({
      user: req.user.id,
      category: category.toLowerCase(),
      limit: Number(limit),
      month: parseInt(month),
      year: parseInt(year),
    });

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Budget already exists for this category and month' });
    }
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budget/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    const { limit } = req.body;
    budget.limit = limit !== undefined ? Number(limit) : budget.limit;
    await budget.save();

    res.json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budget/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    await Budget.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Budget removed', data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
};

