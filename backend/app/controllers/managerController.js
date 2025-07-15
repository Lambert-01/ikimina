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
 * Get manager dashboard data
 * @route GET /api/managers/dashboard
 * @access Private (Manager only)
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Get user with populated groups where user is admin
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Get groups where user is an admin
  const managedGroupIds = user.groups
    .filter(g => g.role === 'admin' && g.status === 'active')
    .map(g => g.group);
  
  // Get detailed group information
  const groups = await Group.find({
    _id: { $in: managedGroupIds }
  }).select('name members contributionSettings loanRules');
  
  // Format groups data with additional statistics
  const groupsWithStats = await Promise.all(groups.map(async (group) => {
    // Get latest contribution cycle
    const latestCycle = await ContributionCycle.findOne({
      group: group._id
    }).sort('-cycleNumber');
    
    // Get active loans for this group
    const activeLoans = await Loan.countDocuments({
      group: group._id,
      status: { $in: ['active', 'overdue'] }
    });
    
    // Calculate compliance rate
    let complianceRate = 100; // Default to 100%
    
    if (latestCycle) {
      const totalMembers = latestCycle.memberContributions.length;
      const paidMembers = latestCycle.memberContributions.filter(m => m.status === 'paid').length;
      complianceRate = totalMembers > 0 ? Math.round((paidMembers / totalMembers) * 100) : 100;
    }
    
    return {
      id: group._id,
      name: group.name,
      memberCount: group.members.length,
      activeLoans,
      balance: latestCycle ? latestCycle.totalCollected : 0,
      complianceRate
    };
  }));
  
  // Get financial summary across all managed groups
  const financialSummary = await ContributionCycle.aggregate([
    {
      $match: {
        group: { $in: managedGroupIds }
      }
    },
    {
      $group: {
        _id: null,
        totalContributions: { $sum: '$totalCollected' },
        totalExpected: { $sum: '$totalExpected' }
      }
    }
  ]);
  
  // Get loan summary
  const loanSummary = await Loan.aggregate([
    {
      $match: {
        group: { $in: managedGroupIds }
      }
    },
    {
      $group: {
        _id: null,
        totalLoans: { $sum: '$amount' },
        totalInterest: { $sum: '$interestAmount' }
      }
    }
  ]);
  
  // Get members from managed groups
  const memberIds = [];
  groups.forEach(group => {
    group.members.forEach(member => {
      if (!memberIds.includes(member.user.toString())) {
        memberIds.push(member.user.toString());
      }
    });
  });
  
  // Get member details
  const members = await User.find({
    _id: { $in: memberIds }
  }).select('firstName lastName phoneNumber');
  
  // Get contribution status for each member
  const memberWithStatus = await Promise.all(members.map(async (member) => {
    // Get latest contribution for this member
    const latestContribution = await Transaction.findOne({
      user: member._id,
      type: 'contribution'
    }).sort('-createdAt');
    
    // Check if member has overdue contributions
    const overdueContributions = await ContributionCycle.countDocuments({
      group: { $in: managedGroupIds },
      'memberContributions.member': member._id,
      'memberContributions.status': { $in: ['late', 'missed'] }
    });
    
    // Determine contribution status
    let contributionStatus = 'up_to_date';
    if (overdueContributions > 0) {
      contributionStatus = 'overdue';
    } else if (!latestContribution) {
      contributionStatus = 'pending';
    }
    
    // Calculate total contributed
    const totalContributed = await Transaction.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(member._id),
          type: 'contribution',
          group: { $in: managedGroupIds.map(id => mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    return {
      id: member._id,
      name: `${member.firstName} ${member.lastName}`,
      contributionStatus,
      lastContribution: latestContribution ? latestContribution.createdAt : null,
      totalContributed: totalContributed.length > 0 ? totalContributed[0].total : 0
    };
  }));
  
  // Get active loans
  const loans = await Loan.find({
    group: { $in: managedGroupIds },
    status: { $in: ['active', 'overdue', 'pending'] }
  }).populate('user', 'firstName lastName');
  
  // Format loans data
  const formattedLoans = loans.map(loan => ({
    id: loan._id,
    memberName: `${loan.user.firstName} ${loan.user.lastName}`,
    amount: loan.amount,
    dueDate: loan.dueDate || loan.nextPaymentDate,
    status: loan.status
  }));
  
  // Get recent activities
  const recentActivities = [];
  
  // Add recent contributions
  const recentContributions = await Transaction.find({
    group: { $in: managedGroupIds },
    type: 'contribution'
  })
  .sort('-createdAt')
  .limit(3)
  .populate('user', 'firstName lastName');
  
  recentContributions.forEach(contribution => {
    recentActivities.push({
      id: contribution._id,
      type: 'contribution',
      description: 'Weekly contribution received',
      date: contribution.createdAt,
      user: `${contribution.user.firstName} ${contribution.user.lastName}`
    });
  });
  
  // Add recent loan activities
  const recentLoanActivities = await Loan.find({
    group: { $in: managedGroupIds }
  })
  .sort('-createdAt')
  .limit(3)
  .populate('user', 'firstName lastName');
  
  recentLoanActivities.forEach(loan => {
    recentActivities.push({
      id: loan._id,
      type: 'loan',
      description: `Loan ${loan.status === 'pending' ? 'requested' : 'approved'}`,
      date: loan.createdAt,
      user: `${loan.user.firstName} ${loan.user.lastName}`
    });
  });
  
  // Sort activities by date
  recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Return dashboard data
  res.status(200).json({
    success: true,
    data: {
      groups: groupsWithStats,
      financials: {
        totalContributions: financialSummary.length > 0 ? financialSummary[0].totalContributions : 0,
        totalLoans: loanSummary.length > 0 ? loanSummary[0].totalLoans : 0,
        totalInterest: loanSummary.length > 0 ? loanSummary[0].totalInterest : 0,
        availableFunds: financialSummary.length > 0 ? 
          financialSummary[0].totalContributions - (loanSummary.length > 0 ? loanSummary[0].totalLoans : 0) : 0
      },
      members: memberWithStatus,
      loans: formattedLoans,
      activities: recentActivities
    }
  });
});

/**
 * Get manager's managed groups
 * @route GET /api/managers/groups
 * @access Private (Manager only)
 */
exports.getManagedGroups = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Find groups where user is an admin
  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Get groups where user is an admin
  const managedGroupIds = user.groups
    .filter(g => g.role === 'admin' && g.status === 'active')
    .map(g => g.group);
  
  // Get detailed group information
  const groups = await Group.find({
    _id: { $in: managedGroupIds }
  }).select('name description members contributionSettings loanRules isActive createdAt');
  
  // Format response
  const formattedGroups = groups.map(group => ({
    _id: group._id,
    name: group.name,
    description: group.description,
    memberCount: group.members.length,
    contributionAmount: group.contributionSettings.amount,
    contributionFrequency: group.contributionSettings.frequency,
    isActive: group.isActive !== false,
    createdAt: group.createdAt
  }));
  
  res.status(200).json({
    success: true,
    count: formattedGroups.length,
    data: formattedGroups
  });
});

/**
 * Get group members
 * @route GET /api/managers/groups/:groupId/members
 * @access Private (Manager only)
 */
exports.getGroupMembers = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  
  // Find group and check if user is admin
  const group = await Group.findById(groupId)
    .populate('members.user', 'firstName lastName phoneNumber email profileImage');
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
  
  // Check if user is admin of this group
  const isAdmin = group.admins.includes(req.user.id);
  
  if (!isAdmin && req.user.role !== 'admin' && process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view this group\'s members'
    });
  }
  
  // Format members data
  const members = group.members.map(member => {
    const user = member.user;
    return {
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      phoneNumber: user.phoneNumber,
      email: user.email,
      profileImage: user.profileImage,
      joinedAt: member.joinedAt,
      status: member.status,
      role: member.role
    };
  });
  
  res.status(200).json({
    success: true,
    count: members.length,
    data: members
  });
});

/**
 * Get group contributions
 * @route GET /api/managers/groups/:groupId/contributions
 * @access Private (Manager only)
 */
exports.getGroupContributions = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { status, page = 1, limit = 20 } = req.query;
  
  // Find group and check if user is admin
  const group = await Group.findById(groupId);
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
  
  // Check if user is admin of this group
  const isAdmin = group.admins.includes(req.user.id);
  
  if (!isAdmin && req.user.role !== 'admin' && process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view this group\'s contributions'
    });
  }
  
  // Build match conditions
  const matchConditions = { group: mongoose.Types.ObjectId(groupId) };
  
  if (status) {
    matchConditions['memberContributions.status'] = status;
  }
  
  // Get contribution cycles
  const contributionCycles = await ContributionCycle.find(matchConditions)
    .sort('-cycleNumber')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('memberContributions.member', 'firstName lastName phoneNumber');
  
  // Count total cycles
  const total = await ContributionCycle.countDocuments(matchConditions);
  
  // Format response
  const formattedCycles = contributionCycles.map(cycle => {
    const memberContributions = cycle.memberContributions.map(contribution => {
      const member = contribution.member;
      return {
        memberId: member._id,
        memberName: member ? `${member.firstName} ${member.lastName}` : 'Unknown Member',
        amount: contribution.amount,
        paidAmount: contribution.paidAmount || 0,
        status: contribution.status,
        paidDate: contribution.paidDate,
        paymentMethod: contribution.paymentMethod
      };
    });
    
    return {
      _id: cycle._id,
      cycleNumber: cycle.cycleNumber,
      startDate: cycle.startDate,
      dueDate: cycle.dueDate,
      status: cycle.status,
      totalExpected: cycle.totalExpected,
      totalCollected: cycle.totalCollected,
      complianceRate: cycle.complianceRate,
      memberContributions
    };
  });
  
  res.status(200).json({
    success: true,
    count: formattedCycles.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: formattedCycles
  });
});

/**
 * Get group loans
 * @route GET /api/managers/groups/:groupId/loans
 * @access Private (Manager only)
 */
exports.getGroupLoans = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { status, page = 1, limit = 20 } = req.query;
  
  // Find group and check if user is admin
  const group = await Group.findById(groupId);
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
  
  // Check if user is admin of this group
  const isAdmin = group.admins.includes(req.user.id);
  
  if (!isAdmin && req.user.role !== 'admin' && process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view this group\'s loans'
    });
  }
  
  // Build query
  const query = { group: groupId };
  
  if (status) {
    query.status = status;
  }
  
  // Count total loans
  const total = await Loan.countDocuments(query);
  
  // Get paginated loans
  const loans = await Loan.find(query)
    .sort('-requestDate')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('user', 'firstName lastName phoneNumber');
  
  // Format loans data
  const formattedLoans = loans.map(loan => ({
    _id: loan._id,
    userId: loan.user._id,
    userName: `${loan.user.firstName} ${loan.user.lastName}`,
    amount: loan.amount,
    interestRate: loan.interestRate,
    totalAmount: loan.totalAmount,
    remainingAmount: loan.remainingAmount,
    duration: loan.requestedDurationMonths,
    purpose: loan.purpose,
    status: loan.status,
    requestDate: loan.requestDate,
    approvalDate: loan.approvalDate,
    disbursementDate: loan.disbursementDate,
    dueDate: loan.dueDate
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
 * Update loan status (approve/reject)
 * @route PUT /api/managers/loans/:loanId/status
 * @access Private (Manager only)
 */
exports.updateLoanStatus = asyncHandler(async (req, res) => {
  const { loanId } = req.params;
  const { status, reason } = req.body;
  
  // Validate status
  if (!status || !['approved', 'rejected', 'disbursed'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid status (approved, rejected, or disbursed)'
    });
  }
  
  // Find loan
  const loan = await Loan.findById(loanId).populate('group');
  
  if (!loan) {
    return res.status(404).json({
      success: false,
      message: 'Loan not found'
    });
  }
  
  // Check if user is admin of the group
  const isAdmin = loan.group.admins.includes(req.user.id);
  
  if (!isAdmin && req.user.role !== 'admin' && process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to update this loan'
    });
  }
  
  // Update loan status
  loan.status = status;
  
  if (status === 'approved') {
    loan.approvalDate = new Date();
    loan.approvedAmount = loan.amount;
    loan.approvedDurationMonths = loan.requestedDurationMonths;
  } else if (status === 'rejected') {
    loan.rejectionReason = reason;
    loan.rejectedBy = req.user.id;
    loan.rejectedAt = new Date();
  } else if (status === 'disbursed') {
    loan.disbursementDate = new Date();
    loan.disbursedAmount = loan.approvedAmount || loan.amount;
    loan.status = 'active';
    loan.startDate = new Date();
    
    // Create transaction record for loan disbursement
    await Transaction.create({
      user: loan.user,
      group: loan.group._id,
      type: 'loan_disbursement',
      amount: loan.disbursedAmount,
      paymentStatus: 'completed',
      completedAt: new Date(),
      loan: loan._id,
      description: `Loan disbursement for ${loan.purpose}`,
      initiatedBy: req.user.id
    });
  }
  
  await loan.save();
  
  // Notify the borrower
  let notificationMessage;
  
  switch (status) {
    case 'approved':
      notificationMessage = `Your loan request of ${loan.amount} RWF has been approved`;
      break;
    case 'rejected':
      notificationMessage = `Your loan request of ${loan.amount} RWF has been rejected${reason ? ': ' + reason : ''}`;
      break;
    case 'disbursed':
      notificationMessage = `Your loan of ${loan.disbursedAmount} RWF has been disbursed to your account`;
      break;
  }
  
  await Notification.create({
    recipient: loan.user,
    group: loan.group._id,
    type: 'loan_update',
    title: `Loan ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: notificationMessage,
    status: 'unread',
    relatedTo: {
      model: 'Loan',
      id: loan._id
    }
  });
  
  res.status(200).json({
    success: true,
    message: `Loan ${status} successfully`,
    data: loan
  });
});

/**
 * Generate group report
 * @route GET /api/managers/reports/:groupId
 * @access Private (Manager only)
 */
exports.generateGroupReport = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { reportType, startDate, endDate } = req.query;
  
  // Find group and check if user is admin
  const group = await Group.findById(groupId);
  
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }
  
  // Check if user is admin of this group
  const isAdmin = group.admins.includes(req.user.id);
  
  if (!isAdmin && req.user.role !== 'admin' && process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to generate reports for this group'
    });
  }
  
  // Parse dates
  const parsedStartDate = startDate ? new Date(startDate) : new Date(0);
  const parsedEndDate = endDate ? new Date(endDate) : new Date();
  
  // Generate report based on type
  let reportData = {};
  
  switch (reportType) {
    case 'contributions':
      // Get contribution cycles in date range
      const cycles = await ContributionCycle.find({
        group: groupId,
        startDate: { $gte: parsedStartDate },
        endDate: { $lte: parsedEndDate }
      }).sort('startDate');
      
      // Calculate statistics
      const totalExpected = cycles.reduce((sum, cycle) => sum + cycle.totalExpected, 0);
      const totalCollected = cycles.reduce((sum, cycle) => sum + cycle.totalCollected, 0);
      const complianceRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
      
      reportData = {
        cycles: cycles.map(cycle => ({
          cycleNumber: cycle.cycleNumber,
          startDate: cycle.startDate,
          dueDate: cycle.dueDate,
          totalExpected: cycle.totalExpected,
          totalCollected: cycle.totalCollected,
          complianceRate: cycle.complianceRate
        })),
        summary: {
          totalCycles: cycles.length,
          totalExpected,
          totalCollected,
          complianceRate
        }
      };
      break;
      
    case 'loans':
      // Get loans in date range
      const loans = await Loan.find({
        group: groupId,
        requestDate: { $gte: parsedStartDate, $lte: parsedEndDate }
      })
      .sort('requestDate')
      .populate('user', 'firstName lastName');
      
      // Calculate statistics
      const totalRequested = loans.reduce((sum, loan) => sum + loan.amount, 0);
      const totalApproved = loans.filter(l => l.status !== 'rejected')
        .reduce((sum, loan) => sum + loan.amount, 0);
      const totalDisbursed = loans.filter(l => l.disbursementDate)
        .reduce((sum, loan) => sum + (loan.disbursedAmount || 0), 0);
      const totalRepaid = loans.filter(l => l.status === 'completed')
        .reduce((sum, loan) => sum + loan.amount, 0);
      
      reportData = {
        loans: loans.map(loan => ({
          id: loan._id,
          borrower: `${loan.user.firstName} ${loan.user.lastName}`,
          amount: loan.amount,
          purpose: loan.purpose,
          requestDate: loan.requestDate,
          status: loan.status,
          approvalDate: loan.approvalDate,
          disbursementDate: loan.disbursementDate,
          dueDate: loan.dueDate
        })),
        summary: {
          totalLoans: loans.length,
          totalRequested,
          totalApproved,
          totalDisbursed,
          totalRepaid,
          approvalRate: loans.length > 0 ? 
            (loans.filter(l => l.status !== 'rejected').length / loans.length) * 100 : 0
        }
      };
      break;
      
    case 'members':
      // Get member activity
      const members = await User.find({
        'groups.group': groupId,
        'groups.joinedAt': { $gte: parsedStartDate, $lte: parsedEndDate }
      })
      .select('firstName lastName phoneNumber email groups');
      
      // Get contribution data for each member
      const memberContributions = await ContributionCycle.aggregate([
        { 
          $match: { 
            group: mongoose.Types.ObjectId(groupId),
            startDate: { $gte: parsedStartDate, $lte: parsedEndDate }
          } 
        },
        { $unwind: '$memberContributions' },
        { 
          $group: { 
            _id: '$memberContributions.member',
            totalExpected: { $sum: '$memberContributions.amount' },
            totalPaid: { $sum: '$memberContributions.paidAmount' },
            cyclesCount: { $sum: 1 },
            paidCount: { 
              $sum: { 
                $cond: [
                  { $eq: ['$memberContributions.status', 'paid'] }, 
                  1, 
                  0
                ] 
              } 
            }
          } 
        }
      ]);
      
      reportData = {
        members: members.map(member => {
          const memberContribution = memberContributions.find(
            mc => mc._id.toString() === member._id.toString()
          ) || { totalExpected: 0, totalPaid: 0, cyclesCount: 0, paidCount: 0 };
          
          const groupMembership = member.groups.find(
            g => g.group.toString() === groupId
          ) || {};
          
          return {
            id: member._id,
            name: `${member.firstName} ${member.lastName}`,
            phoneNumber: member.phoneNumber,
            email: member.email,
            joinedAt: groupMembership.joinedAt,
            role: groupMembership.role,
            status: groupMembership.status,
            contributions: {
              totalExpected: memberContribution.totalExpected,
              totalPaid: memberContribution.totalPaid,
              complianceRate: memberContribution.cyclesCount > 0 ?
                (memberContribution.paidCount / memberContribution.cyclesCount) * 100 : 0
            }
          };
        }),
        summary: {
          totalMembers: members.length,
          activeMembers: members.filter(m => {
            const membership = m.groups.find(g => g.group.toString() === groupId);
            return membership && membership.status === 'active';
          }).length,
          pendingMembers: members.filter(m => {
            const membership = m.groups.find(g => g.group.toString() === groupId);
            return membership && membership.status === 'pending';
          }).length,
          inactiveMembers: members.filter(m => {
            const membership = m.groups.find(g => g.group.toString() === groupId);
            return membership && membership.status === 'inactive';
          }).length
        }
      };
      break;
      
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid report type. Please specify one of: contributions, loans, members'
      });
  }
  
  res.status(200).json({
    success: true,
    reportType,
    timeframe: {
      startDate: parsedStartDate,
      endDate: parsedEndDate
    },
    data: reportData
  });
});
