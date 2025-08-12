const express = require('express');
const router = express.Router();
const { adminAuth } = require('../../middleware/adminAuth');

// Import controllers
const adminDashboardController = require('../controllers/adminDashboardController');
const adminGroupController = require('../controllers/adminGroupController');
const adminUserController = require('../controllers/adminUserController');
const adminLoanController = require('../controllers/adminLoanController');

// Dashboard routes
router.get('/dashboard/stats', adminAuth, adminDashboardController.getDashboardStats);

// Group routes
router.get('/groups', adminAuth, adminGroupController.getGroups);
router.get('/groups/:id', adminAuth, adminGroupController.getGroupById);
router.put('/groups/:id/status', adminAuth, adminGroupController.updateGroupStatus);
router.delete('/groups/:id', adminAuth, adminGroupController.deleteGroup);

// User routes
router.get('/users', adminAuth, adminUserController.getUsers);
router.get('/users/:id', adminAuth, adminUserController.getUserById);
router.put('/users/:id/status', adminAuth, adminUserController.updateUserStatus);
router.delete('/users/:id', adminAuth, adminUserController.deleteUser);

// Loan routes
router.get('/loans', adminAuth, adminLoanController.getLoans);
router.get('/loans/:id', adminAuth, adminLoanController.getLoanById);
router.put('/loans/:id/status', adminAuth, adminLoanController.updateLoanStatus);
router.delete('/loans/:id', adminAuth, adminLoanController.deleteLoan);

module.exports = router; 