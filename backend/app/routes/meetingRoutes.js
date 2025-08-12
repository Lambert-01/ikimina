const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { protect } = require('../../middleware/auth');

// All routes require authentication
router.use(protect);

// Get all meetings for a group
router.get('/group/:groupId', meetingController.getGroupMeetings);

// Get all meetings for the current user
router.get('/user', meetingController.getUserMeetings);

// Get upcoming meetings (with optional limit parameter)
router.get('/upcoming', meetingController.getUpcomingMeetings);

// Get a single meeting by ID
router.get('/:meetingId', meetingController.getMeetingById);

// Create a new meeting for a group
router.post('/group/:groupId', meetingController.createMeeting);

// Update a meeting
router.put('/:meetingId', meetingController.updateMeeting);

// Cancel a meeting
router.put('/:meetingId/cancel', meetingController.cancelMeeting);

// Start a meeting
router.put('/:meetingId/start', meetingController.startMeeting);

// End a meeting
router.put('/:meetingId/end', meetingController.endMeeting);

// Update attendance for a meeting
router.put('/:meetingId/attendance', meetingController.updateAttendance);

// Get attendance for a meeting
router.get('/:meetingId/attendance', meetingController.getMeetingAttendance);

module.exports = router; 