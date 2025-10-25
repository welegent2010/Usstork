const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get current user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;