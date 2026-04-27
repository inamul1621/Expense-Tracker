const PDFDocument = require('pdfkit');
const Transaction = require('../models/Transaction');

// Helper: escape CSV field
const escapeCsv = (field) => {
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// @desc    Export transactions as CSV
// @route   GET /api/export/csv
// @access  Private
const exportCSV = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query;
    const query = { user: req.user.id };

    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    // CSV Header
    let csv = 'Date,Type,Category,Amount,Note\n';

    // CSV Rows
    transactions.forEach((t) => {
      const row = [
        t.date.toISOString().split('T')[0],
        t.type,
        t.category,
        t.amount.toFixed(2),
        t.note || '',
      ].map(escapeCsv);
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Export transactions as PDF
// @route   GET /api/export/pdf
// @access  Private
const exportPDF = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query;
    const query = { user: req.user.id };

    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    // Calculate totals
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');

    // Pipe PDF to response
    doc.pipe(res);

    // Title
    doc.fontSize(24).text('Expense Tracker Report', 50, 50);
    doc.moveDown();

    // Date range
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, doc.y);
    doc.moveDown();

    if (startDate && endDate) {
      doc.text(`Period: ${startDate} to ${endDate}`);
      doc.moveDown();
    }

    // Summary
    doc.fontSize(14).text('Summary', 50, doc.y);
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Total Income: ₹${income.toFixed(2)}`);
    doc.text(`Total Expense: ₹${expense.toFixed(2)}`);
    doc.text(`Net Balance: ₹${(income - expense).toFixed(2)}`);
    doc.moveDown();

    // Transactions Table Header
    doc.fontSize(14).text('Transactions', 50, doc.y);
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const colWidths = [80, 70, 90, 70, 200];
    const colPositions = [50, 130, 200, 290, 360];

    doc.fontSize(10).font('Helvetica-Bold');
    ['Date', 'Type', 'Category', 'Amount', 'Note'].forEach((header, i) => {
      doc.text(header, colPositions[i], tableTop, { width: colWidths[i], align: 'left' });
    });

    doc.moveDown();
    doc.font('Helvetica');

    // Table Rows
    transactions.forEach((t) => {
      const y = doc.y;
      if (y > 700) {
        doc.addPage();
      }

      const rowData = [
        t.date.toISOString().split('T')[0],
        t.type,
        t.category,
        `₹${t.amount.toFixed(2)}`,
        t.note || '-',
      ];

      rowData.forEach((cell, i) => {
        doc.text(cell, colPositions[i], doc.y, { width: colWidths[i], align: 'left' });
      });

      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportCSV,
  exportPDF,
};

