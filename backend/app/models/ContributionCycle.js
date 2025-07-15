const mongoose = require('mongoose');

/**
 * ContributionCycle Schema
 * Tracks group contribution cycles, schedules, and member payments
 */
const ContributionCycleSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  cycleNumber: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  gracePeriodEndDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'grace_period', 'closed'],
    default: 'upcoming'
  },
  memberContributions: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'late', 'missed'],
      default: 'pending'
    },
    amount: {
      type: Number,
      required: true
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    paidDate: Date,
    paymentMethod: {
      type: String,
      enum: ['mobile_money', 'bank_transfer', 'cash', 'other'],
    },
    paymentReference: String,
    lateFee: {
      type: Number,
      default: 0
    },
    notes: String,
    remindersSent: {
      type: Number,
      default: 0
    },
    lastReminderDate: Date,
    transactions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }]
  }],
  totalExpected: {
    type: Number,
    default: 0
  },
  totalCollected: {
    type: Number,
    default: 0
  },
  totalPending: {
    type: Number,
    default: 0
  },
  totalLate: {
    type: Number,
    default: 0
  },
  totalMissed: {
    type: Number,
    default: 0
  },
  complianceRate: {
    type: Number,
    default: 0
  },
  remindersSent: {
    type: Boolean,
    default: false
  },
  lateNoticesSent: {
    type: Boolean,
    default: false
  },
  closedDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/**
 * Calculate and update cycle statistics
 */
ContributionCycleSchema.methods.updateStatistics = function() {
  const totalMembers = this.memberContributions.length;
  const paidMembers = this.memberContributions.filter(m => m.status === 'paid').length;
  const lateMembers = this.memberContributions.filter(m => m.status === 'late').length;
  const missedMembers = this.memberContributions.filter(m => m.status === 'missed').length;
  
  this.totalCollected = this.memberContributions.reduce((sum, m) => sum + (m.paidAmount || 0), 0);
  this.totalPending = this.totalExpected - this.totalCollected;
  this.totalLate = lateMembers * this.amount;
  this.totalMissed = missedMembers * this.amount;
  
  // Calculate compliance rate (paid members / total members)
  this.complianceRate = totalMembers > 0 ? (paidMembers / totalMembers) * 100 : 0;
  
  return this;
};

/**
 * Update cycle status based on dates
 */
ContributionCycleSchema.methods.updateStatus = function() {
  const now = new Date();
  
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now >= this.startDate && now <= this.dueDate) {
    this.status = 'active';
  } else if (now > this.dueDate && now <= this.gracePeriodEndDate) {
    this.status = 'grace_period';
  } else if (now > this.gracePeriodEndDate) {
    this.status = 'closed';
    
    // Mark all pending contributions as missed
    this.memberContributions.forEach(contribution => {
      if (contribution.status === 'pending') {
        contribution.status = 'missed';
      }
    });
    
    // Set closed date if not already set
    if (!this.closedDate) {
      this.closedDate = now;
    }
  }
  
  return this;
};

/**
 * Pre-save hook to update statistics and status
 */
ContributionCycleSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Calculate total expected amount for new cycles
    this.totalExpected = this.memberContributions.length * this.amount;
  }
  
  // Update status and statistics
  this.updateStatus();
  this.updateStatistics();
  
  this.updatedAt = new Date();
  next();
});

/**
 * Static method to create a new contribution cycle
 */
ContributionCycleSchema.statics.createCycle = async function(groupId, members, cycleConfig) {
  const { startDate, endDate, dueDate, gracePeriod, amount } = cycleConfig;
  
  // Calculate grace period end date
  const gracePeriodEndDate = new Date(dueDate);
  gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + (gracePeriod || 3));
  
  // Get the latest cycle number
  const latestCycle = await this.findOne({ group: groupId }).sort('-cycleNumber');
  const cycleNumber = latestCycle ? latestCycle.cycleNumber + 1 : 1;
  
  // Create member contributions array
  const memberContributions = members.map(member => ({
    member: member._id || member,
    status: 'pending',
    amount
  }));
  
  // Create and return the new cycle
  return this.create({
    group: groupId,
    cycleNumber,
    startDate,
    endDate,
    dueDate,
    gracePeriodEndDate,
    amount,
    memberContributions,
    totalExpected: members.length * amount
  });
};

/**
 * Static method to get upcoming contributions for a user
 */
ContributionCycleSchema.statics.getUpcomingContributionsForUser = async function(userId) {
  return this.find({
    'memberContributions.member': userId,
    'memberContributions.status': 'pending',
    status: { $in: ['upcoming', 'active'] }
  })
  .populate('group', 'name contributionSettings')
  .sort('dueDate')
  .lean();
};

/**
 * Static method to get contribution history for a user
 */
ContributionCycleSchema.statics.getContributionHistoryForUser = async function(userId, limit = 10) {
  return this.aggregate([
    // Match cycles with this user as a member
    { $match: { 'memberContributions.member': mongoose.Types.ObjectId(userId) } },
    
    // Unwind to get individual member contributions
    { $unwind: '$memberContributions' },
    
    // Match only this user's contributions
    { $match: { 'memberContributions.member': mongoose.Types.ObjectId(userId) } },
    
    // Sort by cycle date (newest first)
    { $sort: { dueDate: -1 } },
    
    // Limit results
    { $limit: limit },
    
    // Project the fields we want
    { $project: {
      cycleNumber: 1,
      startDate: 1,
      dueDate: 1,
      amount: '$memberContributions.amount',
      paidAmount: '$memberContributions.paidAmount',
      status: '$memberContributions.status',
      paidDate: '$memberContributions.paidDate',
      groupId: '$group'
    }}
  ]);
};

module.exports = mongoose.model('ContributionCycle', ContributionCycleSchema); 