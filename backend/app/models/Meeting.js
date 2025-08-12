const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendeeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'absent'
  },
  arrivalTime: {
    type: String
  },
  notes: {
    type: String
  }
});

const AgendaItemSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  duration: {
    type: Number
  },
  presenter: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const MeetingSchema = new Schema({
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true
  },
  startTime: {
    type: String, // HH:MM format
    required: true
  },
  endTime: {
    type: String // HH:MM format
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true
  },
  virtualMeetingUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  agenda: [AgendaItemSchema],
  attendees: [AttendeeSchema],
  minutes: {
    type: String
  },
  summary: {
    type: String
  },
  attachments: [{
    title: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reminderSettings: {
    type: {
      type: String,
      enum: ['none', 'email', 'sms', 'both'],
      default: 'email'
    },
    time: {
      type: String,
      enum: ['30min', '1hour', '1day', '2days'],
      default: '1day'
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  startedAt: {
    type: Date
  },
  startedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  endedAt: {
    type: Date
  },
  endedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual for meeting duration
MeetingSchema.virtual('duration').get(function() {
  if (!this.startTime || !this.endTime) return null;
  
  const [startHours, startMinutes] = this.startTime.split(':').map(Number);
  const [endHours, endMinutes] = this.endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  return endTotalMinutes - startTotalMinutes;
});

// Virtual for attendance stats
MeetingSchema.virtual('attendanceStats').get(function() {
  if (!this.attendees || this.attendees.length === 0) {
    return {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      presentPercentage: 0
    };
  }
  
  const total = this.attendees.length;
  const present = this.attendees.filter(a => a.status === 'present').length;
  const absent = this.attendees.filter(a => a.status === 'absent').length;
  const late = this.attendees.filter(a => a.status === 'late').length;
  const excused = this.attendees.filter(a => a.status === 'excused').length;
  
  return {
    total,
    present,
    absent,
    late,
    excused,
    presentPercentage: Math.round(((present + late) / total) * 100)
  };
});

// Method to check if a meeting is upcoming
MeetingSchema.methods.isUpcoming = function() {
  const now = new Date();
  const meetingDate = new Date(`${this.date}T${this.startTime}`);
  
  return meetingDate > now;
};

// Method to check if a meeting is in progress
MeetingSchema.methods.isInProgress = function() {
  const now = new Date();
  const meetingDate = new Date(`${this.date}T${this.startTime}`);
  const endDate = this.endTime 
    ? new Date(`${this.date}T${this.endTime}`) 
    : new Date(meetingDate.getTime() + (60 * 60 * 1000)); // Default 1 hour
  
  return now >= meetingDate && now <= endDate;
};

// Method to check if a meeting is past
MeetingSchema.methods.isPast = function() {
  const now = new Date();
  const endDate = this.endTime 
    ? new Date(`${this.date}T${this.endTime}`) 
    : new Date(`${this.date}T${this.startTime}`).getTime() + (60 * 60 * 1000); // Default 1 hour
  
  return now > endDate;
};

// Pre-save middleware to update timestamps
MeetingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Meeting', MeetingSchema); 