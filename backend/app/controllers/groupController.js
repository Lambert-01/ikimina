const Group = require('../models/Group');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const ContributionCycle = require('../models/ContributionCycle'); 
const logger = require('../utils/logger');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new group
 * @route POST /api/groups
 * @access Private
 */
exports.createGroup = asyncHandler(async (req, res) => {
  const { 
    name, 
    description, 
    contributionAmount, 
    contributionFrequency, 
    isPublic,
    maxMembers,
    loanEnabled,
    loanInterestRate,
    loanMaxAmount,
    loanMaxDuration,
    gracePeriod,
    lateFee
  } = req.body;
  
  // Create group with current user as creator and admin
  const group = await Group.create({
    name,
    description,
    creator: req.user.id,
    admins: [req.user.id],
    members: [{
      user: req.user.id,
      joinedAt: Date.now(),
      status: 'active',
      role: 'admin'
    }],
    membershipSettings: {
      approvalRequired: true,
      inviteOnly: !isPublic,
      maxMembers: maxMembers || 25
    },
    contributionSettings: {
      amount: contributionAmount,
      frequency: contributionFrequency || 'monthly',
      gracePeriod: gracePeriod || 3,
      lateFee: lateFee || 0
    },
    loanRules: {
      enabled: loanEnabled || false,
      interestRate: loanInterestRate || 5,
      maxLoanPercent: loanMaxAmount || 200,
      repaymentPeriod: loanMaxDuration || 90
    },
    status: 'active'
  });
  
  // Add group to user's groups
  await User.findByIdAndUpdate(req.user.id, {
    $push: {
      groups: {
        group: group._id,
        joinedAt: Date.now(),
        role: 'admin',
        status: 'active'
      }
    }
  });
  
  // Create first contribution cycle if needed
  if (contributionAmount && contributionFrequency) {
    // Calculate cycle dates based on frequency
    const startDate = new Date();
    const endDate = new Date();
    const dueDate = new Date();
    
    switch (contributionFrequency) {
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        dueDate.setDate(dueDate.getDate() + 7);
        break;
      case 'biweekly':
        endDate.setDate(endDate.getDate() + 14);
        dueDate.setDate(dueDate.getDate() + 14);
        break;
      case 'monthly':
      default:
        endDate.setMonth(endDate.getMonth() + 1);
        dueDate.setMonth(dueDate.getMonth() + 1);
    }
    
    // Create cycle configuration
    const cycleConfig = {
      startDate,
      endDate,
      dueDate,
      gracePeriod: gracePeriod || 3,
      amount: contributionAmount
    };
    
    // Create first contribution cycle with creator as only member
    await ContributionCycle.createCycle(group._id, [req.user.id], cycleConfig);
  }
  
  // Log group creation
  logger.info(`Group created: ${group.name} by user ${req.user.id}`);
  
  // Return success response with group details
  res.status(201).json({
    success: true,
    message: 'Group created successfully',
    data: {
      id: group._id,
      name: group.name,
      description: group.description,
      contributionSettings: group.contributionSettings,
      loanRules: group.loanRules,
      memberCount: 1,
      isAdmin: true
    }
  });
});

/**
 * @desc    Get all groups (that the user is a member of)
 * @route   GET /api/groups
 * @access  Private
 */
exports.getGroups = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Find groups where user is a member
  const groups = await Group.find({
    'members.user': userId
  }).select('name description contributionSettings.amount currency isActive createdAt');

  // Transform the data to match frontend requirements
  const formattedGroups = groups.map(group => {
    return {
      _id: group._id,
      name: group.name,
      description: group.description,
      memberCount: group.members ? group.members.length : 0,
      contributionAmount: group.contributionSettings.amount,
      currency: group.currency || 'RWF',
      isActive: group.isActive !== false, // Default to true if not specified
      createdAt: group.createdAt
    };
  });

  res.status(200).json({
    success: true,
    count: formattedGroups.length,
    data: formattedGroups
  });
});

/**
 * @desc    Get single group by ID
 * @route   GET /api/groups/:id
 * @access  Private
 */
exports.getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('members.user', 'firstName lastName phoneNumber email')
    .populate('creator', 'firstName lastName');

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

  if (!isMember && group.visibility !== 'public') {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view this group'
    });
  }

  res.status(200).json({
    success: true,
    data: group
  });
});

/**
 * @desc    Get public groups for discovery
 * @route   GET /api/groups/public
 * @access  Public
 */
exports.getPublicGroups = asyncHandler(async (req, res) => {
  const { limit = 10, page = 1, search = '' } = req.query;
  
  // Build query for public groups
  const query = {
    'membershipSettings.inviteOnly': false
  };
  
  // Add search if provided
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Count total matching groups
  const total = await Group.countDocuments(query);
  
  // Get paginated groups
  const groups = await Group.find(query)
    .select('name description contributionSettings.amount memberCount createdAt')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  
  // Format response
  const formattedGroups = groups.map(group => ({
    id: group._id,
    name: group.name,
    description: group.description,
    contributionAmount: group.contributionSettings.amount,
    memberCount: group.memberCount || 0,
    createdAt: group.createdAt
  }));
  
  res.status(200).json({
    success: true,
    count: formattedGroups.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: formattedGroups
  });
});

/**
 * @desc    Update group
 * @route   PUT /api/groups/:id
 * @access  Private (Admin only)
 */
exports.updateGroup = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  let group = await Group.findById(req.params.id);

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
      message: 'Only group admins can update group information'
    });
  }

  // Update fields that are present in the request
  const updateData = {};
  const allowedFields = [
    'name', 'description', 'category', 'visibility', 'isActive', 'groupImage'
  ];
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  // Handle nested fields separately
  if (req.body.contributionSettings) {
    updateData.contributionSettings = {
      ...group.contributionSettings,
      ...req.body.contributionSettings
    };
  }

  if (req.body.meetingSettings) {
    updateData.meetingSettings = {
      ...group.meetingSettings,
      ...req.body.meetingSettings
    };
  }

  if (req.body.membershipSettings) {
    updateData.membershipSettings = {
      ...group.membershipSettings,
      ...req.body.membershipSettings
    };
  }

  if (req.body.payoutSettings) {
    updateData.payoutSettings = {
      ...group.payoutSettings,
      ...req.body.payoutSettings
    };
  }

  if (req.body.loanSettings) {
    updateData.loanSettings = {
      ...group.loanSettings,
      ...req.body.loanSettings
    };
  }

  group = await Group.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Group updated successfully',
    data: group
  });
});

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
  if (group.creator.toString() !== req.user.id) {
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
 * @desc    Join a group using group code
 * @route   POST /api/groups/join
 * @access  Private
 */
exports.joinGroup = asyncHandler(async (req, res) => {
  const { groupCode, groupId } = req.body;

  let group;
  
  if (groupCode) {
    group = await Group.findOne({ groupCode });
  } else if (groupId) {
    group = await Group.findById(groupId);
  } else {
    return res.status(400).json({
      success: false,
      message: 'Group code or group ID is required'
    });
  }

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Invalid group code or group not found'
    });
  }

  // Check if user is already a member
  const isMember = group.members.some(
    member => member.user.toString() === req.user.id
  );

  if (isMember) {
    return res.status(400).json({
      success: false,
      message: 'You are already a member of this group'
    });
  }

  // Check if the group has reached maximum members
  if (group.members.length >= group.membershipSettings.maxMembers) {
    return res.status(400).json({
      success: false,
      message: 'Group has reached maximum number of members'
    });
  }

  // Add user to the group with pending or active status based on settings
  const memberStatus = group.membershipSettings.approvalRequired ? 'pending' : 'active';
  
  // Add member to group
  group.members.push({
    user: req.user.id,
    joinedAt: Date.now(),
    status: memberStatus,
    role: 'member'
  });
  
  await group.save();
  
  // Add group to user's groups
  await User.findByIdAndUpdate(req.user.id, {
    $push: {
      groups: {
        group: group._id,
        joinedAt: Date.now(),
        role: 'member',
        status: memberStatus
      }
    }
  });

  // In development mode, auto-approve membership if needed
  if (process.env.NODE_ENV === 'development' && memberStatus === 'pending') {
    // Auto-approve the member
    const memberIndex = group.members.findIndex(m => m.user.toString() === req.user.id);
    if (memberIndex !== -1) {
      group.members[memberIndex].status = 'active';
      await group.save();
      
      // Update user's group status
      await User.findOneAndUpdate(
        { _id: req.user.id, 'groups.group': group._id },
        { $set: { 'groups.$.status': 'active' } }
      );
      
      logger.dev.info(`Development mode: Auto-approved membership for user ${req.user.id} in group ${group._id}`);
    }
  }

  res.status(200).json({
    success: true,
    message: group.membershipSettings.approvalRequired && process.env.NODE_ENV !== 'development'
      ? 'Request to join group sent successfully' 
      : 'Successfully joined the group',
    data: {
      group: {
        _id: group._id,
        name: group.name,
        status: process.env.NODE_ENV === 'development' ? 'active' : memberStatus
      }
    }
  });
});

/**
 * @desc    Leave group
 * @route   POST /api/groups/:id/leave
 * @access  Private
 */
exports.leaveGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if user is a member
  const memberIndex = group.members.findIndex(
    member => member.user.toString() === req.user.id
  );

  if (memberIndex === -1) {
    return res.status(400).json({
      success: false,
      message: 'You are not a member of this group'
    });
  }

  // Check if user is the creator
  if (group.creator.toString() === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'Group creator cannot leave the group. Transfer ownership first or delete the group.'
    });
  }

  // Remove user from group
  group.members.splice(memberIndex, 1);
  await group.save();
  
  // Remove group from user's groups
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { groups: { group: group._id } }
  });

  res.status(200).json({
    success: true,
    message: 'Successfully left the group'
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