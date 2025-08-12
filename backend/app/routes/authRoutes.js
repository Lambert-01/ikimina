const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-verification', authController.sendVerificationCode);
router.post('/verify-otp', authController.verifyOtp);

// Protected routes - all authenticated users
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

// Role-specific routes
router.get('/roles', protect, authController.getUserRoles);
router.post('/roles/request', protect, authController.requestRoleUpgrade);

module.exports = router; 