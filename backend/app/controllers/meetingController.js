const Meeting = require('../models/Meeting');
const Group = require('../models/Group');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const { sendNotification } = require('../utils/helpers');

// Get all meetings for a group
exports.getGroupMeetings = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Verify the group exists and user has access
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    
    // Check if user is a member of the group
    const isMember = group.members.some(member => 
      member.userId.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'You are not a member of this group' });
    }
    
    const meetings = await Meeting.find({ groupId })
      .sort({ date: 1, startTime: 1 })
      .populate('createdBy', 'firstName lastName email');
    
    return res.status(200).json(meetings);
  } catch (error) {
    console.error('Error in getGroupMeetings:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all meetings for the current user
exports.getUserMeetings = async (req, res) => {
  try {
    // Find all groups the user is a member of
    const groups = await Group.find({
      'members.userId': req.user.id
    });
    
    const groupIds = groups.map(group => group._id);
    
    // Find all meetings for these groups
    const meetings = await Meeting.find({
      groupId: { $in: groupIds }
    })
      .sort({ date: 1, startTime: 1 })
    .populate('createdBy', 'firstName lastName email')
    .populate('groupId', 'name');
    
    // Transform the data to match the frontend format
    const formattedMeetings = meetings.map(meeting => {
      const group = groups.find(g => g._id.toString() === meeting.groupId.toString());
      
      return {
        id: meeting._id,
        title: meeting.title,
        date: meeting.date,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        location: meeting.location,
        virtualMeetingUrl: meeting.virtualMeetingUrl,
        description: meeting.description,
        agenda: meeting.agenda || [],
        groupId: meeting.groupId._id,
        groupName: meeting.groupId.name,
        createdBy: meeting.createdBy._id,
        status: meeting.status,
        attendees: meeting.attendees.map(attendee => ({
          id: attendee.userId,
          name: `${attendee.firstName} ${attendee.lastName}`,
          status: attendee.status,
          arrivalTime: attendee.arrivalTime,
          notes: attendee.notes
        }))
      };
    });
    
    return res.status(200).json({
      success: true,
      data: formattedMeetings || [],
      message: 'Meetings retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getUserMeetings:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      data: [] // Always return empty array on error
    });
  }
};

// Get a single meeting by ID
exports.getMeetingById = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const meeting = await Meeting.findById(meetingId)
      .populate('createdBy', 'firstName lastName email')
      .populate('groupId', 'name');
    
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    
    // Check if user has access to this meeting
    const group = await Group.findById(meeting.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    
    const isMember = group.members.some(member => 
      member.userId.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'You do not have access to this meeting' });
    }
    
    // Format the response
    const formattedMeeting = {
      id: meeting._id,
      title: meeting.title,
      date: meeting.date,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      location: meeting.location,
      virtualMeetingUrl: meeting.virtualMeetingUrl,
      description: meeting.description,
      agenda: meeting.agenda || [],
      groupId: meeting.groupId._id,
      groupName: meeting.groupId.name,
      createdBy: meeting.createdBy._id,
      status: meeting.status,
      attendees: meeting.attendees.map(attendee => ({
        id: attendee.userId,
        name: `${attendee.firstName} ${attendee.lastName}`,
        status: attendee.status,
        arrivalTime: attendee.arrivalTime,
        notes: attendee.notes
      }))
    };
    
    return res.status(200).json(formattedMeeting);
  } catch (error) {
    console.error('Error in getMeetingById:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create a new meeting
exports.createMeeting = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { 
      title, 
      date, 
      startTime, 
      endTime, 
      isVirtual, 
      location, 
      virtualMeetingUrl, 
      description, 
      agenda,
      reminderType,
      reminderTime
    } = req.body;
    
    // Verify the group exists and user has access
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    
    // Check if user is a manager or admin of the group
    const isManager = group.members.some(member => 
      member.userId.toString() === req.user.id && 
      ['manager', 'admin'].includes(member.role)
    );
    
    if (!isManager) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to create meetings for this group' 
      });
    }
    
    // Get all group members
    const memberIds = group.members.map(member => member.userId);
    const members = await User.find({ _id: { $in: memberIds } }, 'firstName lastName');
    
    // Create attendees array with all group members
    const attendees = members.map(member => ({
      userId: member._id,
      firstName: member.firstName,
      lastName: member.lastName,
      status: 'absent', // Default status
      notes: ''
    }));
    
    // Create the meeting
    const newMeeting = new Meeting({
      groupId,
      title,
      date,
      startTime,
      endTime,
      isVirtual,
      location: isVirtual ? null : location,
      virtualMeetingUrl: isVirtual ? virtualMeetingUrl : null,
      description,
      agenda: agenda || [],
      status: 'scheduled',
      createdBy: req.user.id,
      attendees,
      reminderSettings: {
        type: reminderType || 'email',
        time: reminderTime || '1day'
      }
    });
    
    await newMeeting.save();
    
    // Send notifications to all group members
    for (const member of group.members) {
      if (member.userId.toString() !== req.user.id) {
        await Notification.create({
          userId: member.userId,
          type: 'meeting_scheduled',
          title: 'New Meeting Scheduled',
          message: `A new meeting "${title}" has been scheduled for ${date} at ${startTime}`,
          relatedId: newMeeting._id,
          relatedModel: 'Meeting',
          read: false
        });
        
        // Send push notification or email if configured
        await sendNotification(
          member.userId, 
          'New Meeting Scheduled', 
          `A new meeting "${title}" has been scheduled for ${date} at ${startTime}`
        );
      }
    }
    
    return res.status(201).json({
      success: true,
      message: 'Meeting created successfully',
      meeting: newMeeting
    });
  } catch (error) {
    console.error('Error in createMeeting:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a meeting
exports.updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const updateData = req.body;
    
    // Find the meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    
    // Check if user has permission to update
    const group = await Group.findById(meeting.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    
    const isManager = group.members.some(member => 
      member.userId.toString() === req.user.id && 
      ['manager', 'admin'].includes(member.role)
    );
    
    const isCreator = meeting.createdBy.toString() === req.user.id;
    
    if (!isManager && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this meeting' 
      });
    }
    
    // Handle virtual meeting changes
    if ('isVirtual' in updateData) {
      if (updateData.isVirtual) {
        updateData.location = null;
      } else {
        updateData.virtualMeetingUrl = null;
      }
    }
    
    // Update the meeting
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    // Notify members about the update
    for (const member of group.members) {
      if (member.userId.toString() !== req.user.id) {
        await Notification.create({
          userId: member.userId,
          type: 'meeting_updated',
          title: 'Meeting Updated',
          message: `The meeting "${meeting.title}" has been updated`,
          relatedId: meeting._id,
          relatedModel: 'Meeting',
          read: false
        });
    
        // Send push notification or email if configured
        await sendNotification(
          member.userId, 
          'Meeting Updated', 
          `The meeting "${meeting.title}" has been updated`
        );
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Meeting updated successfully',
      meeting: updatedMeeting
    });
  } catch (error) {
    console.error('Error in updateMeeting:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Cancel a meeting
exports.cancelMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { reason } = req.body;
    
    // Find the meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    
    // Check if meeting is already cancelled
    if (meeting.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Meeting is already cancelled' });
    }
    
    // Check if user has permission to cancel
    const group = await Group.findById(meeting.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    
    const isManager = group.members.some(member => 
      member.userId.toString() === req.user.id && 
      ['manager', 'admin'].includes(member.role)
    );
    
    const isCreator = meeting.createdBy.toString() === req.user.id;
    
    if (!isManager && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this meeting' 
      });
    }
    
    // Update the meeting
    meeting.status = 'cancelled';
    meeting.cancellationReason = reason || '';
    meeting.cancelledBy = req.user.id;
    meeting.cancelledAt = new Date();
    
    await meeting.save();
    
    // Notify members about the cancellation
    for (const member of group.members) {
      if (member.userId.toString() !== req.user.id) {
        await Notification.create({
          userId: member.userId,
          type: 'meeting_cancelled',
          title: 'Meeting Cancelled',
          message: `The meeting "${meeting.title}" scheduled for ${meeting.date} has been cancelled`,
          relatedId: meeting._id,
          relatedModel: 'Meeting',
          read: false
        });
    
        // Send push notification or email if configured
        await sendNotification(
          member.userId, 
          'Meeting Cancelled', 
          `The meeting "${meeting.title}" scheduled for ${meeting.date} has been cancelled`
        );
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Meeting cancelled successfully',
      meeting
    });
  } catch (error) {
    console.error('Error in cancelMeeting:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update attendance for a meeting
exports.updateAttendance = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { userId, status, arrivalTime, notes } = req.body;
    
    // Find the meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    
    // Check if user has permission to update attendance
    const group = await Group.findById(meeting.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    
    const isManager = group.members.some(member => 
      member.userId.toString() === req.user.id && 
      ['manager', 'admin'].includes(member.role)
    );
    
    // Only managers or the user themselves can update attendance
    if (!isManager && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this attendance record' 
      });
    }
    
    // Find the attendee in the meeting
    const attendeeIndex = meeting.attendees.findIndex(
      attendee => attendee.userId.toString() === userId
    );
    
    if (attendeeIndex === -1) {
      return res.status(404).json({ success: false, message: 'Attendee not found in this meeting' });
    }
    
    // Update the attendance
      meeting.attendees[attendeeIndex].status = status;
    
    if (arrivalTime) {
      meeting.attendees[attendeeIndex].arrivalTime = arrivalTime;
      }
    
    if (notes) {
      meeting.attendees[attendeeIndex].notes = notes;
    }
    
    await meeting.save();
    
    return res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      attendee: meeting.attendees[attendeeIndex]
    });
  } catch (error) {
    console.error('Error in updateAttendance:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get attendance for a meeting
exports.getMeetingAttendance = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    // Find the meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    
    // Check if user has access to this meeting
    const group = await Group.findById(meeting.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    
    const isMember = group.members.some(member => 
      member.userId.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'You do not have access to this meeting' });
    }
    
    // Return the attendance records
    return res.status(200).json(meeting.attendees);
  } catch (error) {
    console.error('Error in getMeetingAttendance:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get upcoming meetings
exports.getUpcomingMeetings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    // Find all groups the user is a member of
    const groups = await Group.find({
      'members.userId': req.user.id
    });
    
    const groupIds = groups.map(group => group._id);
    
    // Find upcoming meetings
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const meetings = await Meeting.find({
      groupId: { $in: groupIds },
      date: { $gte: today.toISOString().split('T')[0] },
      status: { $in: ['scheduled', 'in-progress'] }
    })
    .sort({ date: 1, startTime: 1 })
    .limit(limit)
    .populate('createdBy', 'firstName lastName email')
    .populate('groupId', 'name');
    
    // Transform the data to match the frontend format
    const formattedMeetings = meetings.map(meeting => {
      return {
        id: meeting._id,
        title: meeting.title,
        date: meeting.date,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        location: meeting.location,
        virtualMeetingUrl: meeting.virtualMeetingUrl,
        description: meeting.description,
        agenda: meeting.agenda || [],
        groupId: meeting.groupId._id,
        groupName: meeting.groupId.name,
        createdBy: meeting.createdBy._id,
        status: meeting.status,
        attendees: meeting.attendees.map(attendee => ({
          id: attendee.userId,
          name: `${attendee.firstName} ${attendee.lastName}`,
          status: attendee.status,
          arrivalTime: attendee.arrivalTime,
          notes: attendee.notes
        }))
      };
    });
    
    return res.status(200).json(formattedMeetings);
  } catch (error) {
    console.error('Error in getUpcomingMeetings:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Start a meeting
exports.startMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    // Find the meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    
    // Check if meeting can be started
    if (meeting.status !== 'scheduled') {
      return res.status(400).json({ 
        success: false,
        message: `Meeting cannot be started. Current status: ${meeting.status}` 
      });
    }
    
    // Check if user has permission to start the meeting
    const group = await Group.findById(meeting.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    
    const isManager = group.members.some(member => 
      member.userId.toString() === req.user.id && 
      ['manager', 'admin'].includes(member.role)
    );
    
    const isCreator = meeting.createdBy.toString() === req.user.id;
    
    if (!isManager && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to start this meeting' 
      });
    }
    
    // Update the meeting
    meeting.status = 'in-progress';
    meeting.startedAt = new Date();
    meeting.startedBy = req.user.id;
    
    await meeting.save();
    
    // Notify members that the meeting has started
    for (const member of group.members) {
      if (member.userId.toString() !== req.user.id) {
        await Notification.create({
          userId: member.userId,
          type: 'meeting_started',
          title: 'Meeting Started',
          message: `The meeting "${meeting.title}" has started`,
          relatedId: meeting._id,
          relatedModel: 'Meeting',
          read: false
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Meeting started successfully',
      meeting
    });
  } catch (error) {
    console.error('Error in startMeeting:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// End a meeting
exports.endMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { summary } = req.body;
    
    // Find the meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    
    // Check if meeting can be ended
    if (meeting.status !== 'in-progress') {
      return res.status(400).json({ 
        success: false,
        message: `Meeting cannot be ended. Current status: ${meeting.status}` 
      });
    }
    
    // Check if user has permission to end the meeting
    const group = await Group.findById(meeting.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    
    const isManager = group.members.some(member => 
      member.userId.toString() === req.user.id && 
      ['manager', 'admin'].includes(member.role)
    );
    
    const isCreator = meeting.createdBy.toString() === req.user.id;
    
    if (!isManager && !isCreator) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to end this meeting' 
      });
    }
    
    // Update the meeting
    meeting.status = 'completed';
    meeting.endedAt = new Date();
    meeting.endedBy = req.user.id;
    
    if (summary) {
      meeting.summary = summary;
    }
    
    await meeting.save();
    
    // Notify members that the meeting has ended
    for (const member of group.members) {
      if (member.userId.toString() !== req.user.id) {
        await Notification.create({
          userId: member.userId,
          type: 'meeting_ended',
          title: 'Meeting Ended',
          message: `The meeting "${meeting.title}" has ended`,
          relatedId: meeting._id,
          relatedModel: 'Meeting',
          read: false
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Meeting ended successfully',
      meeting
    });
  } catch (error) {
    console.error('Error in endMeeting:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};