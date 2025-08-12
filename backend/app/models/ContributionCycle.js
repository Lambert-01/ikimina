const mongoose = require('mongoose');

const ContributionCycleSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group is required']
  },
  cycleNumber: {
    type: Number,
    required: [true, 'Cycle number is required'],
    min: 1
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  contributionAmount: {
    type: Number,
    required: [true, 'Contribution amount is required'],
    min: [100, 'Contribution amount must be at least 100 RWF']
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly'],
    default: 'monthly'
  },
  dueDay: {
    type: Number,
    min: 1,
    max: 31
  },
  dueDayOfWeek: {
    type: Number,
    min: 0,
    max: 6
  },
  gracePeriod: {
    type: Number,
    default: 3 // days
  },
  penaltyAmount: {
    type: Number,
    default: 0
  },
  penaltyType: {
    type: String,
    enum: ['fixed', 'percentage', 'none'],
    default: 'none'
  },
  contributionDates: [{
    dueDate: Date,
    reminderSent: {
      type: Boolean,
      default: false
    },
    reminderSentAt: Date
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contributionsExpected: {
      type: Number,
      default: 0
    },
    contributionsMade: {
      type: Number,
      default: 0
    },
    contributionsAmount: {
      type: Number,
      default: 0
    },
    lateContributions: {
      type: Number,
      default: 0
    },
    penaltiesPaid: {
      type: Number,
      default: 0
    }
  }],
  financialSummary: {
  totalExpected: {
    type: Number,
    default: 0
  },
  totalCollected: {
    type: Number,
    default: 0
  },
    totalPenalties: {
    type: Number,
    default: 0
  },
    outstandingAmount: {
    type: Number,
    default: 0
  },
  complianceRate: {
    type: Number,
      default: 0 // percentage
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate contribution dates for the cycle
ContributionCycleSchema.methods.generateContributionDates = function() {
  const dates = [];
  let currentDate = new Date(this.startDate);
  const endDate = this.endDate || new Date(currentDate);
  
  // Set end date to 1 year from start date if not specified
  if (!this.endDate) {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  
  // Generate dates based on frequency
  while (currentDate <= endDate) {
    let nextDate = new Date(currentDate);
    
    switch (this.frequency) {
      case 'daily':
        nextDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        // Set to the next occurrence of dueDayOfWeek
        const dayDiff = this.dueDayOfWeek - currentDate.getDay();
        nextDate.setDate(currentDate.getDate() + (dayDiff > 0 ? dayDiff : dayDiff + 7));
        break;
      case 'biweekly':
        // Set to the next occurrence of dueDayOfWeek, then add 7 days
        const biDayDiff = this.dueDayOfWeek - currentDate.getDay();
        nextDate.setDate(currentDate.getDate() + (biDayDiff > 0 ? biDayDiff : biDayDiff + 7) + 7);
        break;
      case 'monthly':
        // Move to next month, then set to dueDay
        nextDate.setMonth(currentDate.getMonth() + 1);
        nextDate.setDate(this.dueDay);
        break;
    }
    
    // Add to dates array if within cycle period
    if (nextDate <= endDate) {
      dates.push({
        dueDate: nextDate,
        reminderSent: false
      });
    }
    
    // Move current date forward for next iteration
    currentDate = nextDate;
  }
  
  this.contributionDates = dates;
  return this.save();
};

// Update financial summary
ContributionCycleSchema.methods.updateFinancialSummary = function() {
  // Calculate total expected
  const memberCount = this.members.length;
  const contributionCount = this.contributionDates.length;
  const totalExpected = memberCount * contributionCount * this.contributionAmount;
  
  // Calculate totals from member data
  let totalCollected = 0;
  let totalPenalties = 0;
  
  this.members.forEach(member => {
    totalCollected += member.contributionsAmount;
    totalPenalties += member.penaltiesPaid;
  });
  
  // Update financial summary
  this.financialSummary.totalExpected = totalExpected;
  this.financialSummary.totalCollected = totalCollected;
  this.financialSummary.totalPenalties = totalPenalties;
  this.financialSummary.outstandingAmount = totalExpected - totalCollected;
  
  // Calculate compliance rate
  if (totalExpected > 0) {
    this.financialSummary.complianceRate = Math.round((totalCollected / totalExpected) * 100);
  }
  
  return this.save();
};

// Add member to cycle
ContributionCycleSchema.methods.addMember = function(userId) {
  // Check if member already exists
  const existingMember = this.members.find(m => m.user.toString() === userId.toString());
  
  if (!existingMember) {
    this.members.push({
      user: userId,
      contributionsExpected: this.contributionDates.length
    });
    
    // Update financial summary
    this.updateFinancialSummary();
  }
  
  return this.save();
};

// Record contribution for a member
ContributionCycleSchema.methods.recordContribution = function(userId, amount, isLate = false) {
  // Find member
  const memberIndex = this.members.findIndex(m => m.user.toString() === userId.toString());
  
  if (memberIndex === -1) {
    return false;
  }
  
  // Update member contribution data
  this.members[memberIndex].contributionsMade += 1;
  this.members[memberIndex].contributionsAmount += amount;
  
  if (isLate) {
    this.members[memberIndex].lateContributions += 1;
  }
  
  // Update financial summary
  this.updateFinancialSummary();
  
  return this.save();
};

// Complete cycle
ContributionCycleSchema.methods.complete = function() {
  this.status = 'completed';
  this.endDate = this.endDate || new Date();
  return this.save();
};

// Cancel cycle
ContributionCycleSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  if (reason) {
    this.notes = this.notes ? `${this.notes}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
  }
  return this.save();
};

// Get next contribution date
ContributionCycleSchema.methods.getNextContributionDate = function() {
  const now = new Date();
  
  // Find the next due date that is in the future
  const upcomingDates = this.contributionDates
    .filter(date => date.dueDate > now)
    .sort((a, b) => a.dueDate - b.dueDate);
  
  return upcomingDates.length > 0 ? upcomingDates[0].dueDate : null;
};

module.exports = mongoose.model('ContributionCycle', ContributionCycleSchema); 