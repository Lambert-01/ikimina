const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../../middleware/auth');

// Base route: /api/groups

// Public routes
router.get('/public', groupController.getPublicGroups);

// Protected routes
router.use(auth);
router.post('/', groupController.createGroup);
router.get('/', groupController.getGroups);
router.get('/:id', groupController.getGroupById);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

// Group compliance routes
router.get('/:id/compliance', groupController.getGroupCompliance);

// Group contributions routes
router.get('/:id/contributions', groupController.getGroupContributions);

// Member management routes
router.post('/:id/invite', groupController.inviteMembers);
router.put('/:id/members/:memberId/role', groupController.updateMemberRole);
router.post('/:id/join', groupController.joinGroup);
router.post('/:id/leave', groupController.leaveGroup);

// Meeting management routes
router.post('/:id/meetings', groupController.scheduleMeeting);

// Group status management
router.put('/:id/toggle-status', groupController.toggleGroupStatus);

module.exports = router; 