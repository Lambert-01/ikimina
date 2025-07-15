const User = require('../models/User');
const Group = require('../models/Group');
const ContributionCycle = require('../models/ContributionCycle');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Get member profile
 * @route GET /api/members/profile
 * @access Private (Member)
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const user = await User.findById(userId)
    .select('-password -resetPasswordToken -resetPasswordExpire -verificationToken');
    
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * Update member profile
 * @route PUT /api/members/profile
 * @access Private (Member)
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, email, address, language } = req.body;
  
  // Find user by ID
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  if (address) user.address = address;
  if (language) user.language = language;
  
  // Save user
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

/**
 * Get member's groups
 * @route GET /api/members/groups
 * @access Private (Member)
 */
exports.getGroups = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Find all groups the member belongs to
  const groups = await Group.find({ 'members.user': userId })
    .select('name description contributionSettings.amount contributionSettings.frequency meetingSettings isActive createdAt');
  
  // Transform the data to match frontend requirements
  const formattedGroups = groups.map(group => {
    return {
      _id: group._id,
      name: group.name,
      description: group.description,
      memberCount: group.members ? group.members.length : 0,
      contributionAmount: group.contributionSettings.amount,
      contributionFrequency: group.contributionSettings.frequency,
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
 * Get member's contributions
 * @route GET /api/members/contributions
 * @access Private (Member)
 */
exports.getContributions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { groupId, status, page = 1, limit = 10 } = req.query;
  
  // Build match conditions
  const matchConditions = {
    'memberContributions.member': mongoose.Types.ObjectId(userId)
  };
  
  if (groupId) {
    matchConditions.group = mongoose.Types.ObjectId(groupId);
  }
  
  if (status) {
    matchConditions['memberContributions.status'] = status;
  }
  
  // Get contribution history
  const contributions = await ContributionCycle.aggregate([
    // Match cycles with this user as a member
    { $match: matchConditions },
    
    // Unwind to get individual member contributions
    { $unwind: '$memberContributions' },
    
    // Match only this user's contributions
    { $match: { 'memberContributions.member': mongoose.Types.ObjectId(userId) } },
    
    // Sort by cycle date (newest first)
    { $sort: { dueDate: -1 } },
    
    // Skip and limit for pagination
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
    
    // Lookup group details
    { $lookup: {
      from: 'groups',
      localField: 'group',
      foreignField: '_id',
      as: 'groupDetails'
    }},
    
    // Unwind the group details
    { $unwind: '$groupDetails' },
    
    // Project the fields we want
    { $project: {
      _id: { $concat: [{ $toString: '$_id' }, '_', { $toString: '$memberContributions.member' }] },
      cycleId: '$_id',
      cycleNumber: 1,
      startDate: 1,
      dueDate: 1,
      amount: '$memberContributions.amount',
      paidAmount: '$memberContributions.paidAmount',
      status: '$memberContributions.status',
      paidDate: '$memberContributions.paidDate',
      paymentMethod: '$memberContributions.paymentMethod',
      groupId: '$group',
      groupName: '$groupDetails.name'
    }}
  ]);
  
  // Count total contributions
  const total = await ContributionCycle.aggregate([
    { $match: matchConditions },
    { $unwind: '$memberContributions' },
    { $match: { 'memberContributions.member': mongoose.Types.ObjectId(userId) } },
    { $count: 'total' }
  ]);
  
  const totalCount = total.length > 0 ? total[0].total : 0;
  
  res.status(200).json({
    success: true,
    count: contributions.length,
    total: totalCount,
    page: parseInt(page),
    pages: Math.ceil(totalCount / limit),
    data: contributions
  });
});

/**
 * Get member's loans
 * @route GET /api/members/loans
 * @access Private (Member)
 */
exports.getLoans = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { groupId, status, page = 1, limit = 10 } = req.query;
  
  // Build query
  const query = { user: userId };
  
  if (groupId) {
    query.group = groupId;
  }
  
  if (status) {
    query.status = status;
  }
  
  // Count total loans
  const total = await Loan.countDocuments(query);
  
  // Get paginated loans
  const loans = await Loan.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('group', 'name');
  
  // Format loans data
  const formattedLoans = loans.map(loan => ({
    _id: loan._id,
    amount: loan.amount,
    interestRate: loan.interestRate,
    totalAmount: loan.totalAmount,
    remainingAmount: loan.remainingAmount,
    status: loan.status,
    purpose: loan.purpose,
    dueDate: loan.dueDate,
    groupId: loan.group._id,
    groupName: loan.group.name,
    requestDate: loan.createdAt
  }));
  
  res.status(200).json({
    success: true,
    count: formattedLoans.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: formattedLoans
  });
});

/**
 * Get member's notifications
 * @route GET /api/members/notifications
 * @access Private (Member)
 */
exports.getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status = 'unread', page = 1, limit = 20 } = req.query;
  
  // Build query
  const query = { recipient: userId };
  
  if (status !== 'all') {
    query.status = status;
  }
  
  // Count total notifications
  const total = await Notification.countDocuments(query);
  
  // Get paginated notifications
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('group', 'name');
  
  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: notifications
  });
});

/**
 * Get member dashboard data
 * @route GET /api/members/dashboard
 * @access Private
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Get user with populated groups
  const user = await User.findById(userId)
    .populate({
      path: 'groups.group',
      select: 'name contributionSettings membershipSettings members loanRules'
    });
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Get active groups the user belongs to
  const activeGroups = user.groups.filter(g => g.status === 'active');
  
  // Format groups data
  const groups = await Promise.all(activeGroups.map(async (groupMembership) => {
    const group = groupMembership.group;
    
    // Get latest contribution cycle for this group
    const latestCycle = await ContributionCycle.findOne({ 
      group: group._id 
    }).sort('-cycleNumber');
    
    // Get user's contribution status in this cycle
    let contributionStatus = 'pending';
    let nextContributionDue = null;
    let contributionAmount = group.contributionSettings.amount;
    
    if (latestCycle) {
      const memberContribution = latestCycle.memberContributions.find(
        m => m.member.toString() === userId
      );
      
      if (memberContribution) {
        contributionStatus = memberContribution.status;
        nextContributionDue = latestCycle.dueDate;
      }
    }
    
    // Get active loans for this group
    const activeLoans = await Loan.find({
      user: userId,
      group: group._id,
      status: { $in: ['active', 'overdue'] }
    });
    
    return {
      id: group._id,
      name: group.name,
      memberCount: group.members.length,
      balance: latestCycle ? latestCycle.totalCollected : 0,
      contributionAmount,
      contributionFrequency: group.contributionSettings.frequency,
      nextContributionDue: nextContributionDue || new Date(),
      nextMeeting: null, // Would need to fetch from meetings collection
      role: groupMembership.role
    };
  }));
  
  // Get total contributions across all groups
  const contributions = await ContributionCycle.aggregate([
    {
      $match: {
        'memberContributions.member': mongoose.Types.ObjectId(userId),
        'memberContributions.status': 'paid'
      }
    },
    {
      $unwind: '$memberContributions'
    },
    {
      $match: {
        'memberContributions.member': mongoose.Types.ObjectId(userId),
        'memberContributions.status': 'paid'
      }
    },
    {
      $group: {
        _id: null,
        totalContributed: { $sum: '$memberContributions.paidAmount' }
      }
    }
  ]);
  
  // Get all active loans
  const loans = await Loan.find({
    user: userId,
    status: { $in: ['active', 'overdue'] }
  }).populate('group', 'name');
  
  // Format loans data
  const activeLoans = loans.map(loan => ({
    id: loan._id,
    amount: loan.amount,
    amountDue: loan.remainingAmount,
    dueDate: loan.nextPaymentDate || loan.dueDate,
    status: loan.status,
    groupName: loan.group.name
  }));
  
  // Calculate eligible loan amount (based on total contributions)
  const totalContributed = contributions.length > 0 ? contributions[0].totalContributed : 0;
  const eligibleAmount = totalContributed * 2; // Example: 2x contributions
  
  // Get upcoming events (contributions due, meetings)
  const upcomingEvents = [];
  
  // Add upcoming contributions
  const activeCycles = await ContributionCycle.find({
    'memberContributions.member': userId,
    'memberContributions.status': 'pending',
    status: { $in: ['active', 'upcoming'] }
  }).populate('group', 'name');
  
  activeCycles.forEach(cycle => {
    upcomingEvents.push({
      id: cycle._id,
      type: 'contribution',
      title: `${cycle.group.name} Contribution Due`,
      date: cycle.dueDate,
      status: 'upcoming',
      groupName: cycle.group.name
    });
  });
  
  // Add loan payments due
  loans.forEach(loan => {
    if (loan.nextPaymentDate) {
      upcomingEvents.push({
        id: loan._id,
        type: 'loan_payment',
        title: `Loan Payment Due`,
        date: loan.nextPaymentDate,
        status: loan.nextPaymentDate < new Date() ? 'overdue' : 'upcoming',
        groupName: loan.group.name
      });
    }
  });
  
  // Get recent contributions
  const recentContributions = await Transaction.find({
    user: userId,
    type: 'contribution'
  })
  .sort('-createdAt')
  .limit(5)
  .populate('group', 'name');
  
  const formattedContributions = recentContributions.map(transaction => ({
    id: transaction._id,
    date: transaction.createdAt,
    amount: transaction.amount,
    status: transaction.paymentStatus,
    groupName: transaction.group.name
  }));
  
  // Get announcements/notifications
  const announcements = await Notification.find({
    recipient: userId,
    status: 'unread'
  })
  .sort('-createdAt')
  .limit(5);
  
  const formattedAnnouncements = announcements.map(notification => ({
    id: notification._id,
    title: notification.title,
    content: notification.message,
    date: notification.createdAt,
    priority: notification.priority || 'medium'
  }));
  
  // Prepare contribution chart data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const contributionsByMonth = await Transaction.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        type: 'contribution',
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' } 
        },
        amount: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const contributionChartData = contributionsByMonth.map(item => ({
    month: months[item._id.month - 1],
    amount: item.amount
  }));
  
  // Return dashboard data
  res.status(200).json({
    success: true,
    data: {
      groups,
      contributions: {
        totalContributed: totalContributed,
        targetAmount: totalContributed * 1.5, // Example target
        nextDueDate: activeCycles.length > 0 ? activeCycles[0].dueDate : null,
        status: 'up_to_date', // Would need logic to determine this
        history: contributionChartData
      },
      recentContributions: formattedContributions,
      loans: {
        activeLoans,
        eligibleAmount,
        canRequestLoan: activeLoans.length < 2 // Example logic
      },
      upcomingEvents,
      announcements: formattedAnnouncements
    }
  });
});

/**
 * Request a loan
 * @route POST /api/members/loans
 * @access Private (Member)
 */
exports.requestLoan = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { 
    groupId, 
    amount, 
    duration, 
    purpose, 
    guarantors = [] 
  } = req.body;
  
  // Validate group
  const group = await Group.findById(groupId);
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
  
  // Check if user is a member of the group
  const isMember = group.members.some(member => 
    member.user.toString() === userId && member.status === 'active'
  );
  
  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: 'You are not an active member of this group'
    });
  }
  
  // Calculate interest and total amount
  const interestRate = group.loanRules?.interestRate || 5;
  const interestAmount = (amount * interestRate * duration) / 100;
  const totalAmount = parseFloat(amount) + parseFloat(interestAmount);
  
  // Create loan
  const loan = await Loan.create({
    user: userId,
    group: groupId,
    amount: parseFloat(amount),
    interestRate,
    interestAmount,
    totalAmount,
    requestedDurationMonths: duration,
    requestDate: new Date(),
    dueDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000), // Assuming 30 days per month
    purpose,
    status: 'pending',
    remainingAmount: totalAmount,
    guarantors: guarantors.map(guarantor => ({ user: guarantor }))
  });
  
  // In development mode, auto-approve the loan
  if (process.env.NODE_ENV === 'development') {
    loan.status = 'approved';
    loan.approvalDate = new Date();
    await loan.save();
    
    logger.dev.info(`Development mode: Auto-approved loan ${loan._id} for user ${userId}`);
  } else {
    // Notify group admins
    const admins = group.admins || [];
    for (const adminId of admins) {
      await Notification.create({
        recipient: adminId,
        group: groupId,
        type: 'loan_request',
        title: 'New Loan Request',
        message: `A new loan request of ${amount} RWF has been submitted by ${req.user.firstName} ${req.user.lastName}`,
        status: 'unread',
        relatedTo: {
          model: 'Loan',
          id: loan._id
        }
      });
    }
  }
  
  res.status(201).json({
    success: true,
    message: process.env.NODE_ENV === 'development' 
      ? 'Loan request approved automatically (development mode)' 
      : 'Loan request submitted successfully',
    data: loan
  });
});

/**
 * Mark notification as read
 * @route PUT /api/members/notifications/:id
 * @access Private (Member)
 */
exports.markNotificationAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;
  
  // Find notification
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId
  });
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }
  
  // Mark as read
  notification.status = 'read';
  notification.readAt = new Date();
  await notification.save();
  
  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: notification
  });
});
