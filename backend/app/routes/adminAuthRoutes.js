const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  adminLogout,
  createAdmin,
  getAllAdmins,
  updateAdminStatus
} = require('../controllers/adminAuthController');
const { adminAuth, requireSuperAdmin } = require('../../middleware/adminAuth');

// Public admin routes
router.post('/login', adminLogin);

// Protected admin routes
router.get('/me', adminAuth, getAdminProfile);
router.put('/profile', adminAuth, updateAdminProfile);
router.put('/change-password', adminAuth, changeAdminPassword);
router.post('/logout', adminAuth, adminLogout);

// Super admin only routes
router.post('/create-admin', adminAuth, requireSuperAdmin, createAdmin);
router.get('/admins', adminAuth, requireSuperAdmin, getAllAdmins);
router.put('/admins/:id/status', adminAuth, requireSuperAdmin, updateAdminStatus);

module.exports = router;