const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a group name'],
    trim: true,
    maxlength: [100, 'Group name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  groupType: {
    type: String,
    enum: ['savings', 'investment', 'emergency', 'business', 'community', 'other'],
    required: [true, 'Please specify group type']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'closed', 'suspended'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  managers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'secretary', 'treasurer'],
      default: 'member'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'suspended'],
      default: 'active'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    contributionsMade: {
      type: Number,
      default: 0
    },
    totalContributed: {
      type: Number,
      default: 0
    }
  }],
  contributionSettings: {
    amount: {
      type: Number,
      required: [true, 'Please specify contribution amount']
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      required: [true, 'Please specify contribution frequency']
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
      default: 3
    },
    penaltyAmount: {
      type: Number,
      default: 0
    },
    penaltyType: {
      type: String,
      enum: ['fixed', 'percentage', 'none'],
      default: 'none'
    }
  },
  loanSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    interestRate: {
      type: Number,
      default: 5
    },
    maxLoanMultiplier: {
      type: Number,
      default: 3
    },
    maxDurationMonths: {
      type: Number,
      default: 6
    },
    requiresApproval: {
      type: Boolean,
      default: true
    },
    minimumContributions: {
      type: Number,
      default: 3
    }
  },
  meetingSettings: {
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'custom'],
      default: 'monthly'
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31
    },
    time: {
      type: String,
      default: '14:00'
    },
    location: {
      type: String,
      default: 'Virtual'
    },
    durationMinutes: {
      type: Number,
      default: 60
    },
    attendanceRequired: {
      type: Boolean,
      default: true
    }
  },
  joinCode: {
    type: String
  },
  location: {
    province: String,
    district: String,
    sector: String
  },
  financialSummary: {
    totalContributions: {
      type: Number,
      default: 0
    },
    totalLoans: {
      type: Number,
      default: 0
    },
    outstandingLoans: {
      type: Number,
      default: 0
    },
    totalInterestEarned: {
      type: Number,
      default: 0
    },
    availableFunds: {
      type: Number,
      default: 0
    },
    totalPenalties: {
      type: Number,
      default: 0
    }
  },
  cycle: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    number: {
      type: Number,
      default: 1
    }
  },
  memberCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String
  },
  auditLog: [{
    action: {
      type: String,
      required: true,
      enum: ['created', 'approved', 'rejected', 'suspended', 'reactivated', 'updated']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    }
  }]
});

module.exports = mongoose.model('Group', GroupSchema); 