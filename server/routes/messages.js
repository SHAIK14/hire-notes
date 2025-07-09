const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getMessagesByCandidate,
  createMessage,
  updateMessage,
  deleteMessage,
  markMessageAsRead
} = require('../controllers/messageController');

router.get('/candidate/:candidateId', authenticateToken, getMessagesByCandidate);
router.post('/candidate/:candidateId', authenticateToken, createMessage);
router.post('/:messageId/read', authenticateToken, markMessageAsRead);
router.put('/:messageId', authenticateToken, updateMessage);
router.delete('/:messageId', authenticateToken, deleteMessage);

module.exports = router;