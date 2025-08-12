const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const { adminAuth } = require('../../middleware/adminAuth');

// Apply admin authentication to all routes
router.use(adminAuth);

// Dashboard statistics
router.get('/stats', adminDashboardController.getDashboardStats);

// System health
router.get('/health', adminDashboardController.getSystemHealth);

module.exports = router;