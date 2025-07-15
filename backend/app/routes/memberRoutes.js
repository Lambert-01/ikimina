const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authMiddleware, authorize } = require('../../middleware/auth');

// Protect all routes
router.use(authMiddleware);

// Get member dashboard data
router.get('/dashboard', memberController.getDashboard);

// Get member's groups
router.get('/groups', memberController.getGroups);

// Get member's contributions
router.get('/contributions', memberController.getContributions);

// Get member's loans
router.get('/loans', memberController.getLoans);

// Request a loan
router.post('/loans', memberController.requestLoan);

// Get member's notifications
router.get('/notifications', memberController.getNotifications);

// Mark notification as read
router.put('/notifications/:id', memberController.markNotificationAsRead);

// Get member's profile
router.get('/profile', memberController.getProfile);

// Update member's profile
router.put('/profile', memberController.updateProfile);

module.exports = router;
