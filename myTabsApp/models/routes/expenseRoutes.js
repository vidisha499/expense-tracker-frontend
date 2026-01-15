
const express = require('express');
const Expense = require('../models/Expense');

const router = express.Router();

// ADD expense
router.post('/', async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    await Expense.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
