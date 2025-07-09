const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationStats,
  getOfflineNotifications
} = require('../controllers/notificationController');

router.get('/', authenticateToken, getNotifications);
router.get('/stats', authenticateToken, getNotificationStats);
router.get('/offline', authenticateToken, getOfflineNotifications);
router.put('/mark-all-read', authenticateToken, markAllNotificationsAsRead);
router.put('/:notificationId/read', authenticateToken, markNotificationAsRead);
router.delete('/clear-all', authenticateToken, clearAllNotifications);
router.delete('/:notificationId', authenticateToken, deleteNotification);

module.exports = router;