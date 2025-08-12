const express = require('express');
const router = express.Router();
const adminGroupController = require('../controllers/adminGroupController');
const { adminAuth, requirePermission } = require('../../middleware/adminAuth');

// Apply admin authentication to all routes
router.use(adminAuth);

// Group management routes
router.get('/', adminGroupController.getAllGroups);

// Pending groups routes
router.get('/pending', requirePermission(['approve_groups']), adminGroupController.getPendingGroups);
router.get('/pending/:id', requirePermission(['approve_groups']), adminGroupController.getPendingGroupById);
router.post('/approve/:id', requirePermission(['approve_groups']), adminGroupController.approveGroup);
router.post('/reject/:id', requirePermission(['approve_groups']), adminGroupController.rejectGroup);
router.put('/pending/:id/compliance', requirePermission(['approve_groups']), adminGroupController.updateComplianceChecks);

// Group statistics
router.get('/approval-stats', requirePermission(['approve_groups', 'view_system_logs']), adminGroupController.getApprovalStats);

// Legacy routes for backward compatibility
router.get('/legacy-pending', adminGroupController.getPendingGroupsLegacy);
router.get('/:groupId', adminGroupController.getGroupById);
router.put('/:groupId', adminGroupController.updateGroup);
router.delete('/:groupId', adminGroupController.deleteGroup);
router.put('/:groupId/approve-legacy', adminGroupController.approveGroup);
router.put('/:groupId/reject-legacy', adminGroupController.rejectGroup);

module.exports = router;