const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

router.get('/recruiters', authenticateToken, async (req, res) => {
  try {
    const search = req.query.search || '';
    
    const query = { 
      _id: { $ne: req.user._id },
      ...(search ? { name: { $regex: search, $options: 'i' } } : {})
    };
    
    const users = await User.find(query)
      .select('_id name email')
      .limit(10)
      .sort({ name: 1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching recruiters:', error);
    res.status(500).json({ message: 'Failed to fetch recruiters' });
  }
});

module.exports = router;