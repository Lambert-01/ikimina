const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');

// Controller placeholder - we'll implement real functionality later
const notificationController = {
  getNotifications: (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Sample notifications data
    res.json([
      {
        _id: '1',
        type: 'info',
        message: 'Welcome to Ikimina! Complete your profile to get started.',
        timestamp: new Date().toISOString(),
        read: false,
        link: '/settings/profile'
      },
      {
        _id: '2',
        type: 'success',
        message: 'Your account has been verified successfully.',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        read: true
      },
      {
        _id: '3',
        type: 'warning',
        message: 'You have an upcoming contribution payment due in 3 days.',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        read: false,
        link: '/payments/new'
      },
      {
        _id: '4',
        type: 'error',
        message: 'Your recent payment was declined. Please check your payment details.',
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        read: false,
        link: '/payments/history'
      },
      {
        _id: '5',
        type: 'info',
        message: 'A new group meeting has been scheduled for Women Entrepreneurs.',
        timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
        read: true,
        link: '/groups/2'
      }
    ]);
  },
  
  markAsRead: (req, res) => {
    res.json({ message: 'Notification marked as read' });
  },
  
  markAllAsRead: (req, res) => {
    res.json({ message: 'All notifications marked as read' });
  },
  
  deleteNotification: (req, res) => {
    res.json({ message: 'Notification deleted' });
  }
};

// Routes
router.get('/', authMiddleware, notificationController.getNotifications);
router.put('/:id/read', authMiddleware, notificationController.markAsRead);
router.put('/mark-all-read', authMiddleware, notificationController.markAllAsRead);
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

module.exports = router; 