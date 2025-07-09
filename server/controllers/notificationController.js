const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === 'true';

    const filter = { recipient: req.user._id };
    if (unreadOnly) {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'name email')
      .populate('candidateId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalNotifications = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit),
        totalNotifications,
        hasNextPage: page < Math.ceil(totalNotifications / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId, 
        recipient: req.user._id,
        isRead: false
      },
      { 
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or already read' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { 
        recipient: req.user._id,
        isRead: false
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({ 
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

const clearAllNotifications = async (req, res) => {
  try {
    const readOnly = req.query.readOnly === 'true';
    
    const filter = { recipient: req.user._id };
    if (readOnly) {
      filter.isRead = true;
    }

    const result = await Notification.deleteMany(filter);

    res.json({ 
      message: readOnly ? 'All read notifications cleared' : 'All notifications cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Failed to clear notifications' });
  }
};

const getNotificationStats = async (req, res) => {
  try {
    const [unreadCount, totalCount, todayCount] = await Promise.all([
      Notification.countDocuments({
        recipient: req.user._id,
        isRead: false
      }),
      Notification.countDocuments({
        recipient: req.user._id
      }),
      Notification.countDocuments({
        recipient: req.user._id,
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);

    const typeStats = await Notification.aggregate([
      { $match: { recipient: req.user._id } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      unreadCount,
      totalCount,
      todayCount,
      typeStats: typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ message: 'Failed to fetch notification stats' });
  }
};

const getOfflineNotifications = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const lastOnlineTime = user.lastOnline || new Date(0);
    
    const offlineNotifications = await Notification.find({
      recipient: req.user._id,
      createdAt: { $gt: lastOnlineTime },
      isRead: false
    })
      .populate('sender', 'name email')
      .populate('candidateId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      notifications: offlineNotifications,
      count: offlineNotifications.length,
      lastOnline: lastOnlineTime
    });
  } catch (error) {
    console.error('Error fetching offline notifications:', error);
    res.status(500).json({ message: 'Failed to fetch offline notifications' });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationStats,
  getOfflineNotifications
};