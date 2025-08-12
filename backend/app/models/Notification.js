const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification recipient is required']
  },
  type: {
    type: String,
    enum: [
      'contribution_due',
      'contribution_received',
      'contribution_overdue',
      'loan_approved',
      'loan_rejected',
      'loan_due',
      'loan_overdue',
      'meeting_scheduled',
      'meeting_reminder',
      'meeting_cancelled',
      'group_invitation',
      'group_joined',
      'group_request_approved',
      'group_request_rejected',
      'system_announcement',
      'other'
    ],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  contribution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contribution'
  },
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan'
  },
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionText: {
    type: String
  },
  actionLink: {
    type: String
  },
  expiresAt: {
    type: Date
  },
  deliveryStatus: {
    inApp: {
      status: {
        type: String,
        enum: ['pending', 'delivered', 'failed'],
        default: 'pending'
      },
      deliveredAt: Date,
      error: String
    },
    sms: {
      status: {
        type: String,
        enum: ['pending', 'delivered', 'failed', 'not_applicable'],
        default: 'not_applicable'
      },
      deliveredAt: Date,
      error: String
    },
    email: {
      status: {
        type: String,
        enum: ['pending', 'delivered', 'failed', 'not_applicable'],
        default: 'not_applicable'
      },
      deliveredAt: Date,
      error: String
    },
    push: {
      status: {
        type: String,
        enum: ['pending', 'delivered', 'failed', 'not_applicable'],
        default: 'not_applicable'
      },
      deliveredAt: Date,
      error: String
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
NotificationSchema.index({ recipient: 1, read: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

// Method to mark notification as read
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Method to update delivery status
NotificationSchema.methods.updateDeliveryStatus = function(channel, status, error) {
  if (!this.deliveryStatus[channel]) {
    return false;
  }
  
  this.deliveryStatus[channel].status = status;
  
  if (status === 'delivered') {
    this.deliveryStatus[channel].deliveredAt = new Date();
  }
  
  if (error) {
    this.deliveryStatus[channel].error = error;
  }
  
  return this.save();
};

// Static method to create a notification
NotificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = new this({
      recipient: data.recipient,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'normal',
      group: data.group,
      contribution: data.contribution,
      loan: data.loan,
      meeting: data.meeting,
      sender: data.sender,
      actionRequired: data.actionRequired || false,
      actionText: data.actionText,
      actionLink: data.actionLink,
      expiresAt: data.expiresAt,
      metadata: data.metadata
    });
    
    // Set delivery channels based on user preferences
    if (data.deliveryChannels) {
      if (data.deliveryChannels.includes('sms')) {
        notification.deliveryStatus.sms.status = 'pending';
      }
      
      if (data.deliveryChannels.includes('email')) {
        notification.deliveryStatus.email.status = 'pending';
      }
      
      if (data.deliveryChannels.includes('push')) {
        notification.deliveryStatus.push.status = 'pending';
      }
    }
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to get unread count for a user
NotificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ recipient: userId, read: false });
};

// Static method to get recent notifications for a user
NotificationSchema.statics.getRecentNotifications = async function(userId, limit = 10) {
  return await this.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'firstName lastName')
    .populate('group', 'name')
    .lean();
};

module.exports = mongoose.model('Notification', NotificationSchema); 