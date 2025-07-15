const mongoose = require('mongoose');

// Schema for tracking group meetings
const MeetingSchema = new mongoose.Schema({
  // Group reference
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group reference is required']
  },
  
  // Meeting title and details
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // Date and time
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  
  startTime: {
    type: String, // Format: "HH:MM" (24-hour)
    required: [true, 'Start time is required']
  },
  
  endTime: {
    type: String // Format: "HH:MM" (24-hour)
  },
  
  duration: {
    type: Number, // Minutes
    default: 60
  },
  
  timezone: {
    type: String,
    default: 'Africa/Kigali'
  },
  
  // Location
  location: {
    type: {
      type: String,
      enum: ['physical', 'virtual', 'hybrid'],
      default: 'physical'
    },
    address: {
      type: String,
      trim: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    meetingLink: {
      type: String,
      trim: true
    },
    accessCode: {
      type: String,
      trim: true
    },
    hostName: String
  },
  
  // Meeting status
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'canceled', 'postponed'],
    default: 'scheduled'
  },
  
  // Recurring meeting settings
  isRecurring: {
    type: Boolean,
    default: false
  },
  
  recurrencePattern: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'custom'],
      default: 'weekly'
    },
    dayOfWeek: {
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31
    },
    interval: {
      type: Number,
      default: 1 // Every X days/weeks/months
    },
    endDate: Date,
    occurrenceCount: Number
  },
  
  // Agenda
  agenda: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    duration: Number, // Minutes
    presenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'skipped'],
      default: 'pending'
    },
    notes: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Attendance tracking
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['invited', 'confirmed', 'declined', 'tentative', 'present', 'absent', 'late'],
      default: 'invited'
    },
    joinedAt: Date,
    leftAt: Date,
    notes: String,
    isRequired: {
      type: Boolean,
      default: true
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rsvpDate: Date,
    rsvpComment: String,
    proxy: {
      isProxy: {
        type: Boolean,
        default: false
      },
      proxyUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  }],
  
  // Meeting minutes
  minutes: {
    takerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    attachments: [{
      name: String,
      url: String,
      type: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    approvedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    approvedAt: Date
  },
  
  // Files and attachments
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: String,
    size: Number,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Decisions and action items
  decisions: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    madeBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  actionItems: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'canceled'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // Financial discussions
  financialDiscussions: [{
    type: {
      type: String,
      enum: ['contribution', 'loan', 'expense', 'investment', 'other'],
      default: 'other'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    amount: Number,
    description: String,
    decisionsMade: String,
    relatedEntity: {
      model: {
        type: String,
        enum: ['Loan', 'Transaction', 'ContributionCycle']
      },
      id: {
        type: mongoose.Schema.Types.ObjectId
      }
    }
  }],
  
  // Voting records
  votes: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    options: [{
      text: String,
      votes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }]
    }],
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
    },
    startTime: Date,
    endTime: Date,
    result: {
      winningOption: String,
      voteCount: Number,
      timestamp: Date
    }
  }],
  
  // Meeting settings
  settings: {
    requireAttendanceConfirmation: {
      type: Boolean,
      default: false
    },
    sendReminders: {
      type: Boolean,
      default: true
    },
    reminderTiming: [{
      type: Number, // Hours before meeting
      default: 24
    }],
    allowGuests: {
      type: Boolean,
      default: false
    },
    recordMeeting: {
      type: Boolean,
      default: false
    },
    recordingUrl: String,
    isPrivate: {
      type: Boolean,
      default: false
    }
  },
  
  // Meeting statistics
  statistics: {
    attendanceRate: Number, // Percentage
    startedOnTime: Boolean,
    duration: Number, // Actual duration in minutes
    actionItemsCreated: Number,
    actionItemsCompleted: Number
  },
  
  // Meeting organizers
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  facilitator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Reminders sent tracking
  reminders: [{
    sentAt: Date,
    sentTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    type: {
      type: String,
      enum: ['initial', 'reminder', 'update', 'cancellation'],
      default: 'reminder'
    },
    channel: {
      type: String,
      enum: ['email', 'sms', 'push', 'in_app'],
      default: 'in_app'
    }
  }],
  
  // Audit trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  cancellationReason: String,
  
  notes: String
}, {
  timestamps: true
});

// Indexes for faster queries
MeetingSchema.index({ group: 1, scheduledDate: 1 });
MeetingSchema.index({ group: 1, status: 1 });
MeetingSchema.index({ 'attendees.user': 1, scheduledDate: 1 });
MeetingSchema.index({ organizer: 1 });

// Pre-save hook to ensure all attendees are added
MeetingSchema.pre('save', async function(next) {
  // If this is a new meeting, add all group members as attendees
  if (this.isNew && this.group) {
    try {
      // Import Group model
      const Group = mongoose.model('Group');
      const group = await Group.findById(this.group);
      
      if (group && group.members) {
        // Get current attendee user IDs
        const currentAttendeeIds = this.attendees.map(a => a.user.toString());
        
        // Add any group members not already in attendees
        group.members.forEach(member => {
          if (member.status === 'active' && !currentAttendeeIds.includes(member.user.toString())) {
            this.attendees.push({
              user: member.user,
              status: 'invited',
              isRequired: true
            });
          }
        });
      }
    } catch (error) {
      console.error('Error adding group members as attendees:', error);
    }
  }
  
  next();
});

// Calculate total meeting duration
MeetingSchema.methods.calculateTotalDuration = function() {
  if (this.endTime && this.startTime) {
    const [startHours, startMinutes] = this.startTime.split(':').map(Number);
    const [endHours, endMinutes] = this.endTime.split(':').map(Number);
    
    let durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    
    // Handle overnight meetings
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60; // Add a day in minutes
    }
    
    this.duration = durationMinutes;
  }
  
  return this.duration;
};

// Update attendance statistics
MeetingSchema.methods.updateStatistics = function() {
  // Skip if no attendees
  if (!this.attendees || this.attendees.length === 0) {
    return this;
  }
  
  const totalAttendees = this.attendees.length;
  const presentAttendees = this.attendees.filter(a => 
    a.status === 'present' || a.status === 'late'
  ).length;
  
  const attendanceRate = totalAttendees > 0 ? (presentAttendees / totalAttendees) * 100 : 0;
  
  // Determine if meeting started on time
  let startedOnTime = false;
  if (this.status === 'completed' || this.status === 'in_progress') {
    const firstAttendee = this.attendees.find(a => a.joinedAt);
    if (firstAttendee && firstAttendee.joinedAt) {
      const scheduledStart = new Date(this.scheduledDate);
      const actualStart = new Date(firstAttendee.joinedAt);
      startedOnTime = actualStart <= scheduledStart;
    }
  }
  
  // Calculate actual duration for completed meetings
  let actualDuration = this.duration;
  if (this.status === 'completed') {
    const attendeesWithJoinTime = this.attendees.filter(a => a.joinedAt && a.leftAt);
    if (attendeesWithJoinTime.length > 0) {
      // Find earliest join time and latest leave time
      const earliestJoin = Math.min(...attendeesWithJoinTime.map(a => new Date(a.joinedAt).getTime()));
      const latestLeave = Math.max(...attendeesWithJoinTime.map(a => new Date(a.leftAt).getTime()));
      
      actualDuration = Math.ceil((latestLeave - earliestJoin) / (1000 * 60)); // Convert to minutes
    }
  }
  
  // Count action items
  const actionItemsCreated = this.actionItems ? this.actionItems.length : 0;
  const actionItemsCompleted = this.actionItems ? this.actionItems.filter(a => a.status === 'completed').length : 0;
  
  this.statistics = {
    attendanceRate,
    startedOnTime,
    duration: actualDuration,
    actionItemsCreated,
    actionItemsCompleted
  };
  
  return this;
};

// Record attendance
MeetingSchema.methods.recordAttendance = function(userId, status, joinTime = null, leaveTime = null, notes = '') {
  const attendeeIndex = this.attendees.findIndex(a => a.user.toString() === userId.toString());
  
  if (attendeeIndex === -1) {
    // Add new attendee if not found
    this.attendees.push({
      user: userId,
      status: status,
      joinedAt: joinTime || (status === 'present' ? new Date() : undefined),
      leftAt: leaveTime,
      notes: notes
    });
  } else {
    // Update existing attendee
    this.attendees[attendeeIndex].status = status;
    
    if (joinTime) {
      this.attendees[attendeeIndex].joinedAt = joinTime;
    } else if (status === 'present' && !this.attendees[attendeeIndex].joinedAt) {
      this.attendees[attendeeIndex].joinedAt = new Date();
    }
    
    if (leaveTime) {
      this.attendees[attendeeIndex].leftAt = leaveTime;
    }
    
    if (notes) {
      this.attendees[attendeeIndex].notes = notes;
    }
  }
  
  // Update statistics if recording presence
  if (['present', 'absent', 'late'].includes(status)) {
    this.updateStatistics();
  }
  
  return this;
};

// Start the meeting
MeetingSchema.methods.startMeeting = function(userId) {
  if (this.status === 'scheduled' || this.status === 'postponed') {
    this.status = 'in_progress';
    
    // Record facilitator as present if specified
    if (this.facilitator && this.facilitator.toString() === userId.toString()) {
      this.recordAttendance(userId, 'present');
    } else if (this.organizer && this.organizer.toString() === userId.toString()) {
      this.recordAttendance(userId, 'present');
    }
    
    return true;
  }
  
  return false;
};

// End the meeting
MeetingSchema.methods.endMeeting = function() {
  if (this.status === 'in_progress') {
    this.status = 'completed';
    
    // Calculate and update meeting statistics
    this.updateStatistics();
    
    return true;
  }
  
  return false;
};

// Generate next recurring meeting
MeetingSchema.methods.generateNextRecurring = async function() {
  // Only generate next meeting if this is a recurring meeting
  if (!this.isRecurring || !this.recurrencePattern) {
    return null;
  }
  
  // Check if this meeting has an end date or max occurrences
  if (this.recurrencePattern.endDate && new Date(this.recurrencePattern.endDate) <= new Date()) {
    return null;
  }
  
  // Create next meeting instance with similar properties
  const nextMeeting = new this.constructor({
    group: this.group,
    title: this.title,
    description: this.description,
    startTime: this.startTime,
    endTime: this.endTime,
    duration: this.duration,
    timezone: this.timezone,
    location: this.location,
    isRecurring: this.isRecurring,
    recurrencePattern: this.recurrencePattern,
    agenda: this.agenda.map(item => ({
      title: item.title,
      description: item.description,
      duration: item.duration,
      presenter: item.presenter,
      order: item.order
    })),
    organizer: this.organizer,
    facilitator: this.facilitator,
    settings: this.settings,
    createdBy: this.organizer
  });
  
  // Calculate next meeting date based on recurrence pattern
  const nextDate = new Date(this.scheduledDate);
  
  switch (this.recurrencePattern.type) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + (this.recurrencePattern.interval || 1));
      break;
      
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * (this.recurrencePattern.interval || 1)));
      break;
      
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + (14 * (this.recurrencePattern.interval || 1)));
      break;
      
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + (this.recurrencePattern.interval || 1));
      
      // Keep same day of month if possible, or last day if original day doesn't exist
      const originalDay = this.scheduledDate.getDate();
      const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
      nextDate.setDate(Math.min(originalDay, lastDayOfMonth));
      break;
      
    case 'custom':
      // Custom pattern would need specific implementation based on requirements
      break;
  }
  
  nextMeeting.scheduledDate = nextDate;
  
  return nextMeeting;
};

module.exports = mongoose.model('Meeting', MeetingSchema); 