const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get budgets for a month
// @route   GET /api/budgets
const getBudgets = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM format
    const query = { userId: req.user._id };

    if (month) query.month = month;

    const budgets = await Budget.find(query);

    // Calculate spending per category for the month
    let dateFilter = {};
    if (month) {
      const [year, m] = month.split('-');
      const startDate = new Date(year, parseInt(m) - 1, 1);
      const endDate = new Date(year, parseInt(m), 0, 23, 59, 59);
      dateFilter = { date: { $gte: startDate, $lte: endDate } };
    }

    const spending = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'Expense',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: '$category',
          spent: { $sum: '$amount' },
        },
      },
    ]);

    const spendingMap = {};
    spending.forEach((s) => {
      spendingMap[s._id] = s.spent;
    });

    const budgetsWithSpending = budgets.map((b) => ({
      _id: b._id,
      category: b.category,
      limit: b.limit,
      month: b.month,
      spent: spendingMap[b.category] || 0,
      percentage: Math.min(
        ((spendingMap[b.category] || 0) / b.limit) * 100,
        100
      ).toFixed(1),
      exceeded: (spendingMap[b.category] || 0) > b.limit,
    }));

    res.json(budgetsWithSpending);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Server error fetching budgets' });
  }
};

// @desc    Create or update a budget
// @route   POST /api/budgets
const upsertBudget = async (req, res) => {
  try {
    const { category, limit, month } = req.body;

    if (!category || !limit || !month) {
      return res
        .status(400)
        .json({ message: 'Please provide category, limit, and month' });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category, month },
      { limit: parseFloat(limit) },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(budget);
  } catch (error) {
    console.error('Upsert budget error:', error);
    res.status(500).json({ message: 'Server error saving budget' });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: 'Budget removed', id: req.params.id });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Server error deleting budget' });
  }
};

module.exports = { getBudgets, upsertBudget, deleteBudget };
