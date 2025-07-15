const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  // Group administration
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'At least one admin is required']
  }],
  // Membership management
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive', 'suspended', 'left'],
      default: 'pending'
    },
    role: {
      type: String,
      enum: ['member', 'secretary', 'treasurer', 'president', 'vice-president'],
      default: 'member'
    },
    contributions: {
      paid: {
        type: Number,
        default: 0
      },
      missed: {
        type: Number,
        default: 0
      },
      lastPaid: Date
    },
    payoutReceived: {
      type: Boolean,
      default: false
    },
    payoutDate: Date,
    payoutPosition: Number
  }],
  invitations: [{
    email: String,
    phoneNumber: String,
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    token: String,
    expiresAt: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending'
    }
  }],
  membershipSettings: {
    approvalRequired: {
      type: Boolean,
      default: true
    },
    inviteOnly: {
      type: Boolean,
      default: false
    },
    maxMembers: {
      type: Number,
      default: 25
    },
    membershipFee: {
      type: Number,
      default: 0
    }
  },
  // Meeting settings
  meetingSettings: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'weekly'
    },
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: 'saturday'
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31
    },
    time: String,
    duration: {
      type: Number,
      default: 60 // minutes
    },
    location: {
      address: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere' // Supports geospatial queries
      },
      meetingLink: String, // For virtual meetings
      isVirtual: {
        type: Boolean,
        default: false
      }
    },
    reminderDays: {
      type: Number,
      default: 1
    },
    requireAttendance: {
      type: Boolean,
      default: false
    },
    absencePenalty: {
      type: Number,
      default: 0
    }
  },
  meetings: [{
    date: Date,
    agenda: String,
    minutes: String,
    location: {
      address: String,
      coordinates: [Number],
      meetingLink: String,
      isVirtual: Boolean
    },
    attendees: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['present', 'absent', 'excused'],
        default: 'absent'
      },
      notes: String
    }],
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  }],
  // Contribution settings
  contributionSettings: {
    amount: {
      type: Number,
      required: [true, 'Contribution amount is required'],
      min: [0, 'Contribution amount cannot be negative']
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'monthly'
    },
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31
    },
    dueDate: {
      type: Date
    },
    gracePeriod: {
      type: Number,
      default: 3 // days
    },
    lateFee: {
      type: Number,
      default: 0
    },
    allowPartialPayments: {
      type: Boolean,
      default: false
    },
    reminderDays: {
      type: Number,
      default: 1
    },
    paymentMethods: [{
      type: String,
      enum: ['cash', 'mobile_money', 'bank_transfer'],
      default: ['mobile_money']
    }]
  },
  // Payout mechanism settings
  payoutSettings: {
    mechanism: {
      type: String,
      enum: ['rotation', 'lottery', 'loan_based', 'shared_interest'],
      default: 'rotation'
    },
    rotationOrder: {
      type: String,
      enum: ['fixed', 'random', 'need_based'],
      default: 'fixed'
    },
    rotationSchedule: [{
      position: Number,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      scheduledDate: Date,
      status: {
        type: String,
        enum: ['pending', 'paid', 'skipped'],
        default: 'pending'
      }
    }],
    lotteryFrequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'quarterly'],
      default: 'monthly'
    },
    lotteryEligibilityRequirements: {
      minContributions: {
        type: Number,
        default: 1
      },
      mustBePresent: {
        type: Boolean,
        default: false
      }
    }
  },
  // Loan settings
  loanSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    interestRate: {
      type: Number,
      default: 5 // percentage
    },
    maxLoanAmount: {
      type: Number
    },
    maxLoanDurationMonths: {
      type: Number,
      default: 3
    },
    requiresApproval: {
      type: Boolean,
      default: true
    },
    approvalThreshold: {
      type: Number,
      default: 50 // percentage of members needed to approve
    },
    votingDurationHours: {
      type: Number,
      default: 48
    },
    guarantorsRequired: {
      type: Number,
      default: 0
    },
    allowMultipleLoans: {
      type: Boolean,
      default: false
    },
    lateFee: {
      type: Number,
      default: 0
    },
    gracePeriod: {
      type: Number,
      default: 3 // days
    }
  },
  // Rules and regulations
  rules: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    penalty: {
      type: Number,
      default: 0
    }
  }],
  // Financial summary
  financialSummary: {
    totalSavings: {
      type: Number,
      default: 0
    },
    totalLoans: {
      type: Number,
      default: 0
    },
    availableFunds: {
      type: Number,
      default: 0
    },
    totalInterestEarned: {
      type: Number,
      default: 0
    },
    totalPenaltiesCollected: {
      type: Number,
      default: 0
    },
    totalPaidOut: {
      type: Number,
      default: 0
    }
  },
  // Group settings
  currency: {
    type: String,
    default: 'RWF'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'private'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  groupCode: {
    type: String,
    unique: true
  },
  groupImage: String,
  category: {
    type: String,
    enum: ['family', 'friends', 'workplace', 'community', 'other'],
    default: 'community'
  },
  // Cycle tracking
  currentCycle: {
    number: {
      type: Number,
      default: 1
    },
    startDate: Date,
    endDate: Date
  },
  cycles: [{
    number: Number,
    startDate: Date,
    endDate: Date,
    totalContributions: Number,
    totalLoans: Number,
    totalPaidOut: Number,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  // Audit and tracking
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate unique group code before saving
GroupSchema.pre('save', function(next) {
  if (!this.groupCode) {
    // Generate a random 6-character alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    this.groupCode = code;
  }

  // Ensure creator is always an admin
  if (this.creator && !this.admins.includes(this.creator)) {
    this.admins.push(this.creator);
  }

  next();
});

// Virtual for member count
GroupSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.filter(m => m.status === 'active').length : 0;
});

// Virtual for active member count
GroupSchema.virtual('activeMemberCount').get(function() {
  return this.members ? this.members.filter(member => member.status === 'active').length : 0;
});

// Virtual for pending member count
GroupSchema.virtual('pendingMemberCount').get(function() {
  return this.members ? this.members.filter(member => member.status === 'pending').length : 0;
});

// Method to add member
GroupSchema.methods.addMember = async function(userId, role = 'member') {
  // Check if user already exists
  const existingMember = this.members.find(m => m.user.toString() === userId.toString());
  
  if (existingMember) {
    if (existingMember.status === 'left') {
      existingMember.status = 'active';
      existingMember.role = role;
      existingMember.joinedAt = Date.now();
      return await this.save();
    }
    return false; // User already a member
  }
  
  // Add new member
  this.members.push({
    user: userId,
    role: role,
    status: this.membershipSettings.approvalRequired ? 'pending' : 'active',
    joinedAt: Date.now()
  });
  
  return await this.save();
};

// Method to approve member
GroupSchema.methods.approveMember = async function(userId) {
  const member = this.members.find(m => m.user.toString() === userId.toString() && m.status === 'pending');
  
  if (!member) return false;
  
  member.status = 'active';
  return await this.save();
};

// Method to remove member
GroupSchema.methods.removeMember = async function(userId, reason) {
  const memberIndex = this.members.findIndex(m => m.user.toString() === userId.toString());
  
  if (memberIndex === -1) return false;
  
  // Check if admin
  if (this.admins.includes(userId)) {
    // Can't remove if last admin
    if (this.admins.length === 1) return false;
    
    // Remove from admins list
    const adminIndex = this.admins.findIndex(a => a.toString() === userId.toString());
    if (adminIndex !== -1) {
      this.admins.splice(adminIndex, 1);
    }
  }
  
  this.members.splice(memberIndex, 1);
  return await this.save();
};

// Method to calculate next contribution date
GroupSchema.methods.calculateNextContributionDate = function() {
  const now = new Date();
  let nextDate = new Date();
  
  switch (this.contributionSettings.frequency) {
    case 'daily':
      nextDate.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = daysOfWeek.indexOf(this.contributionSettings.dayOfWeek);
      let daysUntilNext = targetDay - now.getDay();
      if (daysUntilNext <= 0) daysUntilNext += 7;
      nextDate.setDate(now.getDate() + daysUntilNext);
      break;
    case 'biweekly':
      const biweeklyTargetDay = daysOfWeek.indexOf(this.contributionSettings.dayOfWeek);
      let biweeklyDaysUntil = biweeklyTargetDay - now.getDay();
      if (biweeklyDaysUntil <= 0) biweeklyDaysUntil += 14;
      else if (biweeklyDaysUntil > 7) biweeklyDaysUntil += 7;
      nextDate.setDate(now.getDate() + biweeklyDaysUntil);
      break;
    case 'monthly':
      const targetDate = this.contributionSettings.dayOfMonth || 1;
      if (now.getDate() >= targetDate) {
        nextDate.setMonth(now.getMonth() + 1);
      }
      nextDate.setDate(targetDate);
      break;
  }
  
  return nextDate;
};

// Method to calculate next meeting date
GroupSchema.methods.calculateNextMeetingDate = function() {
  const now = new Date();
  let nextDate = new Date();
  
  switch (this.meetingSettings.frequency) {
    case 'daily':
      nextDate.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = daysOfWeek.indexOf(this.meetingSettings.dayOfWeek);
      let daysUntilNext = targetDay - now.getDay();
      if (daysUntilNext <= 0) daysUntilNext += 7;
      nextDate.setDate(now.getDate() + daysUntilNext);
      break;
    case 'biweekly':
      const biweeklyTargetDay = daysOfWeek.indexOf(this.meetingSettings.dayOfWeek);
      let biweeklyDaysUntil = biweeklyTargetDay - now.getDay();
      if (biweeklyDaysUntil <= 0) biweeklyDaysUntil += 14;
      else if (biweeklyDaysUntil > 7) biweeklyDaysUntil += 7;
      nextDate.setDate(now.getDate() + biweeklyDaysUntil);
      break;
    case 'monthly':
      const targetDate = this.meetingSettings.dayOfMonth || 1;
      if (now.getDate() >= targetDate) {
        nextDate.setMonth(now.getMonth() + 1);
      }
      nextDate.setDate(targetDate);
      break;
  }
  
  // Set time if specified
  if (this.meetingSettings.time) {
    const [hours, minutes] = this.meetingSettings.time.split(':').map(Number);
    nextDate.setHours(hours, minutes, 0, 0);
  }
  
  return nextDate;
};

// Create indexes for faster queries
GroupSchema.index({ 'members.user': 1 });
GroupSchema.index({ admins: 1 });
GroupSchema.index({ groupCode: 1 });
GroupSchema.index({ category: 1, visibility: 1 });
GroupSchema.index({ 
  name: 'text', 
  description: 'text' 
}, {
  weights: {
    name: 10,
    description: 5
  }
});

module.exports = mongoose.model('Group', GroupSchema); 