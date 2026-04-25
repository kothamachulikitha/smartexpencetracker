const Transaction = require('../models/Transaction');

// @desc    Get all transactions for user
// @route   GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const { category, type, startDate, endDate, search, page = 1, limit = 50 } = req.query;
    const query = { userId: req.user._id };

    if (category) query.category = category;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

// @desc    Add a transaction
// @route   POST /api/transactions
const addTransaction = async (req, res) => {
  try {
    const { type, amount, category, date, description } = req.body;

    if (!type || !amount || !category) {
      return res
        .status(400)
        .json({ message: 'Please provide type, amount, and category' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount: parseFloat(amount),
      category,
      date: date || new Date(),
      description: description || '',
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ message: 'Server error adding transaction' });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error updating transaction' });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction removed', id: req.params.id });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
};

// @desc    Get dashboard summary
// @route   GET /api/transactions/summary
const getSummary = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM format
    const userId = req.user._id;

    let dateFilter = {};
    if (month) {
      const [year, m] = month.split('-');
      const startDate = new Date(year, parseInt(m) - 1, 1);
      const endDate = new Date(year, parseInt(m), 0, 23, 59, 59);
      dateFilter = { date: { $gte: startDate, $lte: endDate } };
    }

    // Totals
    const totals = await Transaction.aggregate([
      { $match: { userId, ...dateFilter } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const income =
      totals.find((t) => t._id === 'Income')?.total || 0;
    const expenses =
      totals.find((t) => t._id === 'Expense')?.total || 0;
    const savings = income - expenses;
    const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;

    // Category breakdown for expenses
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { userId, type: 'Expense', ...dateFilter } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Transaction.aggregate([
      { $match: { userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    // AI Insights
    const insights = [];
    if (categoryBreakdown.length > 0) {
      const topCategory = categoryBreakdown[0];
      insights.push(
        `Your highest expense category is ${topCategory._id} at $${topCategory.total.toFixed(2)}`
      );
    }
    if (parseFloat(savingsRate) > 20) {
      insights.push(
        `Great job! You're saving ${savingsRate}% of your income this period.`
      );
    } else if (parseFloat(savingsRate) < 10 && income > 0) {
      insights.push(
        `Heads up: Your savings rate is only ${savingsRate}%. Consider cutting some expenses.`
      );
    }
    if (expenses > income && income > 0) {
      insights.push(
        `Warning: Your expenses exceed your income by $${(expenses - income).toFixed(2)}.`
      );
    }

    res.json({
      income,
      expenses,
      savings,
      savingsRate: parseFloat(savingsRate),
      categoryBreakdown,
      monthlyTrends,
      recentTransactions,
      insights,
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error fetching summary' });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
};
