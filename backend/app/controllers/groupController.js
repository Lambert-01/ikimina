const Group = require('../models/Group');
const User = require('../models/User');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const ContributionCycle = require('../models/ContributionCycle'); 
const logger = require('../utils/logger');
const { asyncHandler } = require('../../middleware/errorHandler');
const crypto = require('crypto'); // Added for invitation token generation

/**
 * Get all groups where the user is a member
 */
exports.getMemberGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all groups where user is a member
    const groups = await Group.find({
      'members.user': userId
    })
    .populate('members.user', 'firstName lastName')
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      data: groups,
      message: 'Groups retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching member groups:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch groups. Please try again.'
    });
  }
};

/**
 * Get all groups where the user is a manager
 */
exports.getManagedGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all groups where user is a manager
    const groups = await Group.find({
      managers: userId
    })
    .populate('members.user', 'firstName lastName')
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      data: groups,
      message: 'Managed groups retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching managed groups:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch managed groups. Please try again.'
    });
    }
};

/**
 * Get public groups for joining
 */
exports.getPublicGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, province, district, sector, minMembers, maxMembers } = req.query;
    
    // Build filter query
    const filterQuery = { status: 'active' };
    
    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (province) filterQuery['location.province'] = province;
    if (district) filterQuery['location.district'] = district;
    if (sector) filterQuery['location.sector'] = sector;
    
    if (minMembers) filterQuery.memberCount = { $gte: parseInt(minMembers) };
    if (maxMembers) {
      if (filterQuery.memberCount) {
        filterQuery.memberCount.$lte = parseInt(maxMembers);
      } else {
        filterQuery.memberCount = { $lte: parseInt(maxMembers) };
      }
    }
    
    // Don't show groups the user is already a member of
    const groups = await Group.find({
      ...filterQuery,
      'members.user': { $ne: userId }
    })
    .limit(20)
    .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: groups,
      message: 'Public groups retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching public groups:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch public groups. Please try again.'
    });
  }
};

/**
 * Get a specific group by ID
 */
exports.getGroupById = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
      success: false,
        message: 'Invalid group ID format'
      });
    }
    
    const group = await Group.findById(groupId)
      .populate('members.user', 'firstName lastName email phoneNumber')
      .populate('createdBy', 'firstName lastName')
      .populate('managers', 'firstName lastName');
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user has permission to view this group
    const isMember = group.members.some(member => member.user._id.toString() === userId);
    const isManager = group.managers.some(manager => manager._id.toString() === userId);
    
    if (!isMember && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this group'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: group,
      message: 'Group retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return res.status(500).json({
        success: false,
      message: 'Failed to fetch group. Please try again.'
    });
  }
};

/**
 * Create a new group
 */
exports.createGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      groupType,
      contributionAmount,
      contributionFrequency,
      loanSettings,
      meetingSettings
    } = req.body;
    
    // Validation
    if (!name || !description || !groupType || !contributionAmount || !contributionFrequency) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Create group
    const newGroup = new Group({
      name,
      description,
      groupType,
      status: 'pending', // Groups start as pending and need admin approval
      createdBy: userId,
      managers: [userId], // Creator is automatically a manager
      members: [
        {
          user: userId,
          role: 'member',
          status: 'active',
          joinedAt: new Date()
        }
      ],
      contributionSettings: {
        amount: contributionAmount,
        frequency: contributionFrequency,
        dueDay: contributionFrequency === 'monthly' ? 5 : undefined,
        dueDayOfWeek: contributionFrequency === 'weekly' ? 1 : undefined, // Monday
        gracePeriod: 3,
        penaltyAmount: 0,
        penaltyType: 'none'
      },
      loanSettings: {
        enabled: loanSettings?.enabled || false,
        interestRate: loanSettings?.interestRate || 5,
        maxLoanMultiplier: loanSettings?.maxLoanMultiplier || 3,
        maxDurationMonths: loanSettings?.maxDurationMonths || 6,
        requiresApproval: true,
        minimumContributions: 3
      },
      meetingSettings: {
        frequency: meetingSettings?.frequency || 'monthly',
        dayOfWeek: meetingSettings?.dayOfWeek,
        dayOfMonth: meetingSettings?.dayOfMonth || 15,
        time: meetingSettings?.time || '14:00',
        location: 'Virtual',
        durationMinutes: 60,
        attendanceRequired: true
      },
      financialSummary: {
        totalContributions: 0,
        totalLoans: 0,
        outstandingLoans: 0,
        totalInterestEarned: 0,
        availableFunds: 0,
        totalPenalties: 0
      },
      cycle: {
        startDate: new Date(),
        isActive: true,
        number: 1
      },
      memberCount: 1
    });
    
    await newGroup.save();
    
    // Update user document to track group memberships and manager roles
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        memberOfGroups: newGroup._id,
        managerOfGroups: newGroup._id
      }
    });
    
    return res.status(201).json({
    success: true,
      data: newGroup,
      message: 'Group created successfully'
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create group. Please try again.'
    });
  }
};

/**
 * Join a group
 */
exports.joinGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    const { joinCode } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID format'
      });
    }
    
    const group = await Group.findById(groupId);

  if (!group) {
    return res.status(404).json({
      success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user is already a member
    const isAlreadyMember = group.members.some(member => member.user.toString() === userId);
    
    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }
    
    // If the group requires a join code, verify it
    if (group.joinCode && group.joinCode !== joinCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid join code'
      });
    }
    
    // Add user to the group
    group.members.push({
      user: userId,
      role: 'member',
      status: 'active',
      joinedAt: new Date()
    });
    
    // Update member count
    group.memberCount = group.members.length;
    
    await group.save();

    // Update user document
    await User.findByIdAndUpdate(userId, {
      $addToSet: { memberOfGroups: groupId }
    });
    
    return res.status(200).json({
    success: true,
      message: 'Successfully joined group'
    });
  } catch (error) {
    console.error('Error joining group:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to join group. Please try again.'
    });
  }
};

/**
 * Check if user has manager role for a group
 */
exports.checkManagerRole = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID format'
      });
    }
    
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    const isManager = group.managers.includes(userId);
    
    return res.status(200).json({
      success: true,
      isManager,
      message: 'Role check completed'
    });
  } catch (error) {
    console.error('Error checking manager role:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check role. Please try again.'
    });
  }
};

/**
 * Update a group
 */
exports.updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID format'
      });
    }
    
    const group = await Group.findById(groupId);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

    // Check if user has manager permission
    const isManager = group.managers.some(manager => manager.toString() === userId);
    
    if (!isManager) {
    return res.status(403).json({
      success: false,
        message: 'You do not have permission to update this group'
    });
  }

    // Fields that can be updated
    const updatableFields = [
      'name', 'description', 'status', 'contributionSettings',
      'loanSettings', 'meetingSettings', 'joinCode'
    ];
    
    const updateData = {};
    
    // Only update fields that were provided
    Object.keys(req.body).forEach(key => {
      if (updatableFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });
    
    const updatedGroup = await Group.findByIdAndUpdate(groupId, 
    { $set: updateData },
      { new: true }
  );

    return res.status(200).json({
    success: true,
      data: updatedGroup,
      message: 'Group updated successfully'
  });
  } catch (error) {
    console.error('Error updating group:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update group. Please try again.'
});
  }
};

/**
 * @desc    Delete group
 * @route   DELETE /api/groups/:id
 * @access  Private (Creator only)
 */
exports.deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Only creator can delete the group
  if (group.createdBy.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Only the group creator can delete the group'
    });
  }

  await group.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Group deleted successfully'
  });
});

/**
 * @desc    Get group compliance score and factors
 * @route   GET /api/groups/:id/compliance
 * @access  Private
 */
exports.getGroupCompliance = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if user is a member of this group
  const isMember = group.members.some(
    member => member.user.toString() === req.user.id
  );

  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view this group'
    });
  }

  // Calculate compliance score based on various factors
  const memberCount = group.members.length;
  const activeMembers = group.members.filter(m => m.status === 'active').length;
  const memberParticipation = Math.round((activeMembers / memberCount) * 100) || 0;
  
  // Calculate payment compliance
  const totalExpectedContributions = memberCount * 4; // Assuming 4 contributions per cycle
  const totalPaidContributions = group.members.reduce((sum, member) => {
    return sum + (member.contributions?.paid || 0);
  }, 0);
  const paymentCompliance = Math.round((totalPaidContributions / totalExpectedContributions) * 100) || 0;
  
  // Calculate meeting attendance
  const meetingAttendance = 85; // Placeholder - would be calculated from actual meeting attendance
  
  // Calculate documentation completeness
  const documentationScore = 70; // Placeholder - would be calculated from actual documentation
  
  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (memberParticipation * 0.3) + 
    (paymentCompliance * 0.4) + 
    (meetingAttendance * 0.2) + 
    (documentationScore * 0.1)
  );
  
  // Identify compliance issues
  const complianceIssues = [];
  
  if (paymentCompliance < 70) {
    const overdueMembers = group.members.filter(m => 
      (m.contributions?.missed || 0) > 0
    ).length;
    
    complianceIssues.push({
      id: '1',
      type: overdueMembers > 3 ? 'critical' : 'warning',
      message: `${overdueMembers} members have missed their recent contributions`,
      affectedMembers: overdueMembers
    });
  }
  
  if (memberParticipation < 60) {
    complianceIssues.push({
      id: '2',
      type: 'warning',
      message: 'Low member participation rate',
    });
  }
  
  // Check if next meeting is scheduled
  const hasUpcomingMeeting = group.meetings && 
    group.meetings.some(m => new Date(m.date) > new Date() && m.status === 'scheduled');
    
  if (!hasUpcomingMeeting) {
    complianceIssues.push({
      id: '3',
      type: 'info',
      message: 'Next meeting needs to be scheduled'
    });
  }
  
  // Prepare response
  const complianceData = {
    overallScore,
    lastUpdated: new Date(),
    factors: [
      {
        name: 'Member Participation',
        score: memberParticipation,
        trend: 'stable',
        description: 'Percentage of active members'
      },
      {
        name: 'Payment Compliance',
        score: paymentCompliance,
        trend: paymentCompliance < 75 ? 'down' : 'up',
        description: 'On-time contributions'
      },
      {
        name: 'Meeting Attendance',
        score: meetingAttendance,
        trend: 'up',
        description: 'Meeting attendance rate'
      },
      {
        name: 'Documentation',
        score: documentationScore,
        trend: 'stable',
        description: 'Records and documentation'
      }
    ],
    issues: complianceIssues
  };

  res.status(200).json({
    success: true,
    data: complianceData
  });
});

/**
 * @desc    Get group contributions
 * @route   GET /api/groups/:id/contributions
 * @access  Private
 */
exports.getGroupContributions = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('members.user', 'firstName lastName');

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if user is a member of this group
  const isMember = group.members.some(
    member => member.user._id.toString() === req.user.id
  );

  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view this group'
    });
  }

  // Get contribution cycles for this group
  const contributionCycles = await ContributionCycle.find({ group: group._id })
    .sort('-cycleNumber');
  
  // Format contribution data
  const contributions = [];
  
  contributionCycles.forEach(cycle => {
    cycle.memberContributions.forEach(contribution => {
      // Find member details
      const member = group.members.find(m => 
        m.user._id.toString() === contribution.member.toString()
      );
      
      if (member) {
        contributions.push({
          _id: `${cycle._id}_${contribution.member}`,
          memberId: contribution.member,
          memberName: `${member.user.firstName} ${member.user.lastName}`,
          amount: contribution.amount,
          paidAmount: contribution.paidAmount,
          date: cycle.dueDate,
          status: contribution.status,
          paymentMethod: contribution.paymentMethod,
          notes: contribution.notes,
          cycleId: cycle._id,
          cycleName: `Cycle ${cycle.cycleNumber}`
        });
      }
    });
  });
  
  // Sort by date (newest first)
  contributions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.status(200).json({
    success: true,
    count: contributions.length,
    data: contributions
  });
});

/**
 * @desc    Invite members to a group
 * @route   POST /api/groups/:id/invite
 * @access  Private (Admin only)
 */
exports.inviteMembers = asyncHandler(async (req, res) => {
  const { emails } = req.body;
  
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide at least one email address'
    });
  }

  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if user is an admin of this group
  if (!group.admins.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Only group admins can invite members'
    });
  }

  // Process each email
  const invitationResults = [];
  
  for (const email of emails) {
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    
    // Check if this email is already invited
    const alreadyInvited = group.invitations.some(invite => 
      invite.email === email && ['pending', 'accepted'].includes(invite.status)
    );
    
    // Check if this user is already a member
    const alreadyMember = existingUser && group.members.some(
      member => member.user.toString() === existingUser._id.toString()
    );
    
    if (alreadyMember) {
      invitationResults.push({
        email,
        status: 'error',
        message: 'User is already a member of this group'
      });
      continue;
    }
    
    if (alreadyInvited) {
      invitationResults.push({
        email,
        status: 'error',
        message: 'User has already been invited to this group'
      });
      continue;
    }
    
    // Generate invitation token
    const token = Math.random().toString(36).substring(2, 15);
    
    // Add invitation to group
    group.invitations.push({
      email,
      invitedBy: req.user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'pending'
    });
    
    invitationResults.push({
      email,
      status: 'success',
      message: 'Invitation sent successfully'
    });
    
    // In a real application, send email to the user with invitation link
    // sendInvitationEmail(email, token, group.name, req.user.name);
  }
  
  await group.save();

  res.status(200).json({
    success: true,
    message: 'Invitations processed',
    data: invitationResults
  });
});

/**
 * @desc    Update member role
 * @route   PUT /api/groups/:id/members/:memberId/role
 * @access  Private (Admin only)
 */
exports.updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  
  if (!role || !['member', 'treasurer', 'secretary', 'president', 'vice-president'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid role'
    });
  }

  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if user is an admin of this group
  if (!group.admins.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Only group admins can update member roles'
    });
  }

  // Find the member to update
  const memberIndex = group.members.findIndex(
    member => member.user.toString() === req.params.memberId
  );
  
  if (memberIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Member not found in this group'
    });
  }
  
  // Update the member's role
  group.members[memberIndex].role = role;
  
  // If role is president or vice-president, add to admins if not already there
  if (['president', 'vice-president'].includes(role) && !group.admins.includes(req.params.memberId)) {
    group.admins.push(req.params.memberId);
  }
  
  await group.save();

  res.status(200).json({
    success: true,
    message: 'Member role updated successfully',
    data: {
      memberId: req.params.memberId,
      role
    }
  });
});

/**
 * @desc    Schedule a group meeting
 * @route   POST /api/groups/:id/meetings
 * @access  Private (Admin only)
 */
exports.scheduleMeeting = asyncHandler(async (req, res) => {
  const { date, agenda, location, isVirtual, meetingLink, type } = req.body;
  
  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a meeting date'
    });
  }

  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if user is an admin of this group
  if (!group.admins.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Only group admins can schedule meetings'
    });
  }

  // Create new meeting
  const newMeeting = {
    date: new Date(date),
    agenda: agenda || '',
    type: type || 'regular',
    location: {
      address: location || '',
      isVirtual: isVirtual || false,
      meetingLink: meetingLink || ''
    },
    attendees: [],
    status: 'scheduled'
  };
  
  // Add meeting to group
  if (!group.meetings) {
    group.meetings = [];
  }
  
  group.meetings.push(newMeeting);
  await group.save();

  res.status(201).json({
    success: true,
    message: 'Meeting scheduled successfully',
    data: newMeeting
  });
});

/**
 * @desc    Toggle group active status
 * @route   PUT /api/groups/:id/toggle-status
 * @access  Private (Admin only)
 */
exports.toggleGroupStatus = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if user is an admin of this group
  if (!group.admins.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Only group admins can update group status'
    });
  }

  // Toggle the active status
  group.isActive = !group.isActive;
  
  await group.save();

  res.status(200).json({
    success: true,
    message: `Group ${group.isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      isActive: group.isActive
    }
  });
});

/**
 * Get pending groups (Admin only)
 */
exports.getPendingGroups = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    // Find all pending groups
    const groups = await Group.find({ status: 'pending' })
      .populate('createdBy', 'firstName lastName phoneNumber email')
      .populate('members.user', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: groups,
      message: 'Pending groups retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching pending groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending groups'
    });
  }
};

/**
 * Approve a group (Admin only)
 */
exports.approveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    // Find and update group
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    if (group.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Group is not pending approval'
      });
    }
    
    group.status = 'active';
    group.approvedAt = new Date();
    group.approvedBy = req.user.id;
    await group.save();
    
    logger.info(`Group ${group.name} approved by admin ${req.user.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Group approved successfully',
      data: group
    });
  } catch (error) {
    logger.error('Error approving group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve group'
    });
  }
};

/**
 * Reject a group (Admin only)
 */
exports.rejectGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Check if user is admin
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    // Find and update group
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    if (group.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Group is not pending approval'
      });
    }
    
    group.status = 'rejected';
    group.rejectedAt = new Date();
    group.rejectedBy = req.user.id;
    group.rejectionReason = reason || 'No reason provided';
    await group.save();
    
    logger.info(`Group ${group.name} rejected by admin ${req.user.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Group rejected successfully',
      data: group
    });
  } catch (error) {
    logger.error('Error rejecting group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject group'
    });
  }
}; 