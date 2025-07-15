const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  type: {
    type: String,
    enum: [
      'contribution', 
      'loan_request',
      'loan_approval',
      'loan_rejection',
      'loan_repayment',
      'loan_overdue',
      'meeting_reminder',
      'group_invitation',
      'system',
      'other'
    ],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  channels: [{
    type: String,
    enum: ['sms', 'email', 'push', 'in_app'],
    required: [true, 'At least one notification channel is required']
  }],
  relatedTo: {
    model: {
      type: String,
      enum: ['Transaction', 'Loan', 'Meeting', 'Group', 'User']
    },
    id: mongoose.Schema.Types.ObjectId
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  deliveryStatus: [{
    channel: {
      type: String,
      enum: ['sms', 'email', 'push', 'in_app']
    },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'failed'],
      default: 'queued'
    },
    sentAt: Date,
    deliveredAt: Date,
    failedAt: Date,
    errorMessage: String,
    providerResponse: mongoose.Schema.Types.Mixed
  }],
  readAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  language: {
    type: String,
    enum: ['en', 'rw', 'fr'],
    default: 'rw' // Default language is Kinyarwanda
  }
}, {
  timestamps: true
});

// Index for faster queries
NotificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ group: 1, type: 1 });

// Mark notification as read
NotificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Archive notification
NotificationSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Update delivery status for a channel
NotificationSchema.methods.updateDeliveryStatus = function(channel, status, details = {}) {
  const channelStatus = this.deliveryStatus.find(item => item.channel === channel);
  
  if (channelStatus) {
    channelStatus.status = status;
    
    if (status === 'sent') {
      channelStatus.sentAt = new Date();
    } else if (status === 'delivered') {
      channelStatus.deliveredAt = new Date();
    } else if (status === 'failed') {
      channelStatus.failedAt = new Date();
      channelStatus.errorMessage = details.errorMessage || '';
    }
    
    if (details.providerResponse) {
      channelStatus.providerResponse = details.providerResponse;
    }
  } else {
    const newStatus = {
      channel,
      status
    };
    
    if (status === 'sent') {
      newStatus.sentAt = new Date();
    } else if (status === 'delivered') {
      newStatus.deliveredAt = new Date();
    } else if (status === 'failed') {
      newStatus.failedAt = new Date();
      newStatus.errorMessage = details.errorMessage || '';
    }
    
    if (details.providerResponse) {
      newStatus.providerResponse = details.providerResponse;
    }
    
    this.deliveryStatus.push(newStatus);
  }
  
  return this.save();
};

module.exports = mongoose.model('Notification', NotificationSchema); 