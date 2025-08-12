const Group = require('../models/Group');
const User = require('../models/User');
const PendingGroup = require('../models/PendingGroup');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * @desc    Get all groups with pagination and filtering
 * @route   GET /admin/groups
 * @access  Private (Admin)
 */
exports.getAllGroups = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get groups with pagination
    const [groups, totalGroups] = await Promise.all([
      Group.find(filter)
        .populate('createdBy', 'firstName lastName email')
        .populate('members.userId', 'firstName lastName email phoneNumber')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Group.countDocuments(filter)
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalGroups / parseInt(limit));

    // Format groups data
    const formattedGroups = groups.map(group => ({
      _id: group._id,
      name: group.name,
      description: group.description,
      status: group.status,
      memberCount: group.members.length,
      maxMembers: group.maxMembers,
      contributionAmount: group.contributionAmount,
      contributionFrequency: group.contributionFrequency,
      createdBy: group.createdBy,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      members: group.members.map(member => ({
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        status: member.status
      }))
    }));

    res.status(200).json({
      success: true,
      data: {
        groups: formattedGroups,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalGroups,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch groups'
    });
  }
};

/**
 * @desc    Get pending groups for approval
 * @route   GET /api/admin/groups/pending
 * @access  Private (Admin)
 */
exports.getPendingGroups = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status = 'pending',
    priority,
    region,
    sortBy = 'submittedAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (region) filter.region = region;

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get pending groups with pagination
  const [pendingGroups, totalPending] = await Promise.all([
    PendingGroup.find(filter)
      .populate('proposedManager', 'firstName lastName email phoneNumber')
      .populate('reviewedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    PendingGroup.countDocuments(filter)
  ]);

  // Calculate total pages
  const totalPages = Math.ceil(totalPending / parseInt(limit));

  // Format pending groups data
  const formattedPendingGroups = pendingGroups.map(group => ({
    _id: group._id,
    name: group.name,
    description: group.description,
    proposedManager: group.proposedManager,
    maxMembers: group.maxMembers,
    contributionAmount: group.contributionAmount,
    contributionFrequency: group.contributionFrequency,
    region: group.region,
    district: group.district,
    sector: group.sector,
    status: group.status,
    priority: group.priority,
    complianceChecks: group.complianceChecks,
    isReadyForApproval: group.isReadyForApproval(),
    submittedAt: group.submittedAt,
    reviewedBy: group.reviewedBy,
    reviewNotes: group.reviewNotes,
    reviewedAt: group.reviewedAt
  }));

  res.status(200).json({
    success: true,
    data: {
      pendingGroups: formattedPendingGroups,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPending,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
});

/**
 * @desc    Get pending group by ID
 * @route   GET /api/admin/groups/pending/:id
 * @access  Private (Admin)
 */
exports.getPendingGroupById = asyncHandler(async (req, res) => {
  const pendingGroup = await PendingGroup.findById(req.params.id)
    .populate('proposedManager', 'firstName lastName email phoneNumber nationalId')
    .populate('reviewedBy', 'firstName lastName email');

  if (!pendingGroup) {
    return res.status(404).json({
      success: false,
      message: 'Pending group not found'
    });
  }

  res.status(200).json({
    success: true,
    data: pendingGroup
  });
});

/**
 * @desc    Approve a pending group
 * @route   POST /api/admin/groups/approve/:id
 * @access  Private (Admin)
 */
exports.approveGroup = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const pendingGroupId = req.params.id;

  // Find the pending group
  const pendingGroup = await PendingGroup.findById(pendingGroupId)
    .populate('proposedManager');

  if (!pendingGroup) {
    return res.status(404).json({
      success: false,
      message: 'Pending group not found'
    });
  }

  if (pendingGroup.status !== 'pending' && pendingGroup.status !== 'under_review') {
    return res.status(400).json({
      success: false,
      message: 'Group has already been processed'
    });
  }

  // Check if all compliance requirements are met
  if (!pendingGroup.isReadyForApproval()) {
    return res.status(400).json({
      success: false,
      message: 'Group does not meet all compliance requirements for approval'
    });
  }

  // Approve the pending group
  await pendingGroup.approve(req.admin.id, notes);

  // Create the actual group in the main collection
  const newGroup = new Group({
    name: pendingGroup.name,
    description: pendingGroup.description,
    maxMembers: pendingGroup.maxMembers,
    contributionAmount: pendingGroup.contributionAmount,
    contributionFrequency: pendingGroup.contributionFrequency,
    meetingFrequency: pendingGroup.meetingFrequency,
    meetingLocation: pendingGroup.meetingLocation,
    loanInterestRate: pendingGroup.loanInterestRate,
    maxLoanMultiplier: pendingGroup.maxLoanMultiplier,
    region: pendingGroup.region,
    district: pendingGroup.district,
    sector: pendingGroup.sector,
    createdBy: pendingGroup.proposedManager._id,
    status: 'active',
    members: [{
      userId: pendingGroup.proposedManager._id,
      role: 'admin',
      joinedAt: new Date(),
      status: 'active'
    }]
  });

  await newGroup.save();

  // Update the user to include manager role and group membership
  const user = await User.findById(pendingGroup.proposedManager._id);
  
  // Add manager role if not already present
  if (!user.roles.includes('manager')) {
    user.roles.push('manager');
  }

  // Add group membership
  user.groups.push({
    group: newGroup._id,
    role: 'admin',
    joinedAt: new Date(),
    status: 'active'
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Group approved successfully',
    data: {
      groupId: newGroup._id,
      groupName: newGroup.name,
      managerId: user._id,
      managerName: `${user.firstName} ${user.lastName}`
    }
  });
});

/**
 * @desc    Reject a pending group
 * @route   POST /api/admin/groups/reject/:id
 * @access  Private (Admin)
 */
exports.rejectGroup = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const pendingGroupId = req.params.id;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  // Find the pending group
  const pendingGroup = await PendingGroup.findById(pendingGroupId);

  if (!pendingGroup) {
    return res.status(404).json({
      success: false,
      message: 'Pending group not found'
    });
  }

  if (pendingGroup.status !== 'pending' && pendingGroup.status !== 'under_review') {
    return res.status(400).json({
      success: false,
      message: 'Group has already been processed'
    });
  }

  // Reject the pending group
  await pendingGroup.reject(req.admin.id, reason);

  res.status(200).json({
    success: true,
    message: 'Group rejected successfully',
    data: {
      groupName: pendingGroup.name,
      rejectionReason: reason
    }
  });
});

/**
 * @desc    Update compliance checks for pending group
 * @route   PUT /api/admin/groups/pending/:id/compliance
 * @access  Private (Admin)
 */
exports.updateComplianceChecks = asyncHandler(async (req, res) => {
  const { complianceChecks } = req.body;
  const pendingGroupId = req.params.id;

  const pendingGroup = await PendingGroup.findById(pendingGroupId);

  if (!pendingGroup) {
    return res.status(404).json({
      success: false,
      message: 'Pending group not found'
    });
  }

  // Update compliance checks
  Object.assign(pendingGroup.complianceChecks, complianceChecks);
  
  // Update status based on compliance
  if (pendingGroup.isReadyForApproval()) {
    pendingGroup.status = 'under_review';
  }

  await pendingGroup.save();

  res.status(200).json({
    success: true,
    message: 'Compliance checks updated successfully',
    data: {
      complianceChecks: pendingGroup.complianceChecks,
      isReadyForApproval: pendingGroup.isReadyForApproval(),
      status: pendingGroup.status
    }
  });
});

/**
 * @desc    Get group approval statistics
 * @route   GET /api/admin/groups/approval-stats
 * @access  Private (Admin)
 */
exports.getApprovalStats = asyncHandler(async (req, res) => {
  const [
    totalPending,
    totalUnderReview,
    totalApproved,
    totalRejected,
    totalReadyForApproval
  ] = await Promise.all([
    PendingGroup.countDocuments({ status: 'pending' }),
    PendingGroup.countDocuments({ status: 'under_review' }),
    PendingGroup.countDocuments({ status: 'approved' }),
    PendingGroup.countDocuments({ status: 'rejected' }),
    PendingGroup.countDocuments({
      'complianceChecks.documentationComplete': true,
      'complianceChecks.managerVerified': true,
      'complianceChecks.locationVerified': true,
      'complianceChecks.rulesCompliant': true
    })
  ]);

  // Get regional distribution
  const regionalStats = await PendingGroup.aggregate([
    {
      $group: {
        _id: '$region',
        count: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approved: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalPending,
        totalUnderReview,
        totalApproved,
        totalRejected,
        totalReadyForApproval
      },
      regionalStats
    }
  });
});

/**
 * @desc    Original pending groups method (keeping for compatibility)
 * @route   GET /api/groups/pending
 * @access  Private (Admin)
 */
exports.getPendingGroupsLegacy = async (req, res) => {
  try {
    const pendingGroups = await Group.find({ status: 'pending' })
      .populate('createdBy', 'firstName lastName email phoneNumber')
      .populate('members.userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const formattedGroups = pendingGroups.map(group => ({
      _id: group._id,
      name: group.name,
      description: group.description,
      status: group.status,
      memberCount: group.members.length,
      maxMembers: group.maxMembers,
      contributionAmount: group.contributionAmount,
      contributionFrequency: group.contributionFrequency,
      createdBy: group.createdBy,
      createdAt: group.createdAt,
      members: group.members.slice(0, 5).map(member => ({
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt
      }))
    }));

    res.status(200).json({
      success: true,
      data: formattedGroups
    });
  } catch (error) {
    console.error('Get pending groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending groups'
    });
  }
};

/**
 * @desc    Approve a group
 * @route   PUT /admin/groups/:groupId/approve
 * @access  Private (Admin)
 */
exports.approveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { approvalNotes } = req.body;

    const group = await Group.findById(groupId);
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

    // Update group status
    group.status = 'active';
    group.approvedBy = req.admin.id;
    group.approvedAt = new Date();
    if (approvalNotes) {
      group.approvalNotes = approvalNotes;
    }

    await group.save();

    // TODO: Send notification to group creator and members

    res.status(200).json({
      success: true,
      message: 'Group approved successfully',
      data: group
    });
  } catch (error) {
    console.error('Approve group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve group'
    });
  }
};

/**
 * @desc    Reject a group
 * @route   PUT /admin/groups/:groupId/reject
 * @access  Private (Admin)
 */
exports.rejectGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const group = await Group.findById(groupId);
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

    // Update group status
    group.status = 'rejected';
    group.rejectedBy = req.admin.id;
    group.rejectedAt = new Date();
    group.rejectionReason = rejectionReason;

    await group.save();

    // TODO: Send notification to group creator

    res.status(200).json({
      success: true,
      message: 'Group rejected successfully',
      data: group
    });
  } catch (error) {
    console.error('Reject group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject group'
    });
  }
};

/**
 * @desc    Get single group details
 * @route   GET /admin/groups/:groupId
 * @access  Private (Admin)
 */
exports.getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('createdBy', 'firstName lastName email phoneNumber')
      .populate('members.userId', 'firstName lastName email phoneNumber nationalId')
      .populate('approvedBy', 'firstName lastName email')
      .populate('rejectedBy', 'firstName lastName email');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Get group by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group details'
    });
  }
};

/**
 * @desc    Update group details
 * @route   PUT /admin/groups/:groupId
 * @access  Private (Admin)
 */
exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdBy;
    delete updates.createdAt;
    delete updates.members;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      data: group
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group'
    });
  }
};

/**
 * @desc    Delete group
 * @route   DELETE /admin/groups/:groupId
 * @access  Private (Admin)
 */
exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if group has active transactions or loans
    const hasActiveTransactions = await require('../models/Transaction').countDocuments({
      groupId,
      status: { $in: ['pending', 'processing'] }
    });

    const hasActiveLoans = await require('../models/Loan').countDocuments({
      groupId,
      status: { $in: ['pending', 'active'] }
    });

    if (hasActiveTransactions > 0 || hasActiveLoans > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete group with active transactions or loans'
      });
    }

    await Group.findByIdAndDelete(groupId);

    res.status(200).json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete group'
    });
  }
};