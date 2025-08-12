const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const { adminAuth } = require('../../middleware/adminAuth');

// Apply admin authentication to all routes
router.use(adminAuth);

// User management routes
router.get('/', adminUserController.getAllUsers);
router.get('/stats', adminUserController.getUserStats);
router.get('/:userId', adminUserController.getUserById);
router.put('/:userId/status', adminUserController.updateUserStatus);
router.put('/:userId/roles', adminUserController.updateUserRoles);
router.put('/:userId/verify', adminUserController.verifyUser);
router.delete('/:userId', adminUserController.deleteUser);

module.exports = router;