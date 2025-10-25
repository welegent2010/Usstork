const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { Trade } = require('../models');

const router = express.Router();

// Get all trades for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const trades = await Trade.findAll({
      where: { user_id: req.userId },
      order: [['date', 'DESC']]
    });

    // Group trades by stock code and calculate aggregated data
    const tradesByCode = {};
    trades.forEach(trade => {
      const code = trade.code.toUpperCase();
      if (!tradesByCode[code]) {
        tradesByCode[code] = {
          code,
          trades: [],
          totalShares: 0,
          totalCost: 0,
          avgCost: 0
        };
      }
      
      tradesByCode[code].trades.push(trade);
      tradesByCode[code].totalShares += trade.shares;
      tradesByCode[code].totalCost += (parseFloat(trade.price) * trade.shares) + parseFloat(trade.fee);
    });

    // Calculate average costs
    Object.keys(tradesByCode).forEach(code => {
      const stock = tradesByCode[code];
      stock.avgCost = stock.totalShares > 0 ? stock.totalCost / stock.totalShares : 0;
    });

    res.json({
      trades: tradesByCode,
      allTrades: trades
    });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get trades for specific stock code
router.get('/:code', authMiddleware, async (req, res) => {
  try {
    const { code } = req.params;
    const trades = await Trade.findAll({
      where: { 
        user_id: req.userId,
        code: code.toUpperCase()
      },
      order: [['date', 'ASC']]
    });

    // Calculate aggregated data
    let totalShares = 0;
    let totalCost = 0;
    
    trades.forEach(trade => {
      totalShares += trade.shares;
      totalCost += (parseFloat(trade.price) * trade.shares) + parseFloat(trade.fee);
    });

    const avgCost = totalShares > 0 ? totalCost / totalShares : 0;

    res.json({
      code: code.toUpperCase(),
      trades,
      totalShares,
      totalCost,
      avgCost
    });
  } catch (error) {
    console.error('Get stock trades error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new trade
router.post('/', authMiddleware, [
  body('code').isString().isLength({ min: 1, max: 10 }),
  body('price').isFloat({ min: 0 }),
  body('shares').isInt({ min: 1 }),
  body('date').isISO8601(),
  body('fee').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, price, shares, date, fee = 8.00 } = req.body;

    const trade = await Trade.create({
      user_id: req.userId,
      code: code.toUpperCase(),
      price,
      shares,
      fee,
      date
    });

    res.status(201).json(trade);
  } catch (error) {
    console.error('Add trade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Simulate adding more shares
router.post('/simulate/:code', authMiddleware, [
  body('currentPrice').isFloat({ min: 0 }),
  body('addShares').isInt({ min: 1 }),
  body('fee').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.params;
    const { currentPrice, addShares, fee = 8.00 } = req.body;

    // Get existing trades for this stock
    const existingTrades = await Trade.findAll({
      where: { 
        user_id: req.userId,
        code: code.toUpperCase()
      }
    });

    // Calculate current position
    let currentShares = 0;
    let currentCost = 0;
    
    existingTrades.forEach(trade => {
      currentShares += trade.shares;
      currentCost += (parseFloat(trade.price) * trade.shares) + parseFloat(trade.fee);
    });

    // Calculate new position
    const newShares = currentShares + addShares;
    const additionalCost = (currentPrice * addShares) + fee;
    const newTotalCost = currentCost + additionalCost;
    const newAvgCost = newTotalCost / newShares;

    res.json({
      code: code.toUpperCase(),
      currentShares,
      currentAvgCost: currentShares > 0 ? currentCost / currentShares : 0,
      newShares,
      newAvgCost,
      newTotalCost,
      additionalCost,
      costChange: newAvgCost - (currentShares > 0 ? currentCost / currentShares : 0)
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;