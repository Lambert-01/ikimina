const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../../middleware/auth');

// Get routes
router.get('/member', auth, groupController.getMemberGroups);
router.get('/managed', auth, groupController.getManagedGroups);
router.get('/public', auth, groupController.getPublicGroups);
router.get('/pending', auth, groupController.getPendingGroups);
router.get('/:id', auth, groupController.getGroupById);
router.get('/:id/role', auth, groupController.checkManagerRole);

// Post routes
router.post('/', auth, groupController.createGroup);
router.post('/:id/join', auth, groupController.joinGroup);

// Put routes
router.put('/:id', auth, groupController.updateGroup);

// Admin routes
router.patch('/:id/approve', auth, groupController.approveGroup);
router.patch('/:id/reject', auth, groupController.rejectGroup);

module.exports = router; 