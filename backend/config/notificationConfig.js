const winston = require('winston');
require('dotenv').config();

/**
 * Notification configuration for the IKIMINA platform
 * Supports multiple notification channels: in-app, email, SMS
 */
const notificationConfig = {
  sms: {
    provider: process.env.SMS_PROVIDER || 'rwandatel',
    apiKey: process.env.SMS_API_KEY,
    secretKey: process.env.SMS_SECRET_KEY,
    senderId: process.env.SMS_SENDER_ID || 'IKIMINA',
    baseUrl: process.env.SMS_API_URL,
    enabled: process.env.SMS_ENABLED === 'true',
    // Providers supported: rwandatel, africasTalking
  },
  
  email: {
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    from: process.env.EMAIL_FROM || 'noreply@ikimina.rw',
    enabled: process.env.EMAIL_ENABLED === 'true'
      },
  
  push: {
    enabled: process.env.PUSH_ENABLED === 'true',
    firebaseCredentials: process.env.FIREBASE_CREDENTIALS_FILE,
  },
  
  templates: {
    // Contribution related
    contributionReminder: {
      subject: 'Reminder: Your IKIMINA Contribution is Due',
      smsTemplate: 'Hello {name}, your {amount} RWF contribution to {groupName} is due on {dueDate}. Please make your payment.',
      // Additional email template data would be defined here
    },
    contributionReceived: {
      subject: 'Contribution Received: {groupName}',
      smsTemplate: 'Hello {name}, your {amount} RWF contribution to {groupName} has been received. Thank you!',
    },
    contributionOverdue: {
      subject: 'Overdue Contribution: {groupName}',
      smsTemplate: 'Hello {name}, your {amount} RWF contribution to {groupName} was due on {dueDate} and is now overdue.',
    },
    
    // Loan related
    loanRequestCreated: {
      subject: 'New Loan Request in {groupName}',
      smsTemplate: 'A loan of {amount} RWF has been requested in {groupName}. Please login to vote.',
    },
    loanApproved: {
      subject: 'Your Loan Request was Approved',
      smsTemplate: 'Good news! Your loan request for {amount} RWF in {groupName} has been approved.',
    },
    loanRejected: {
      subject: 'Your Loan Request was Not Approved',
      smsTemplate: 'Your loan request for {amount} RWF in {groupName} was not approved.',
    },
    loanRepaymentReminder: {
      subject: 'Loan Repayment Reminder',
      smsTemplate: 'Reminder: Your {amount} RWF loan repayment for {groupName} is due on {dueDate}.',
    },
    
    // Group related
    groupInvitation: {
      subject: "You've Been Invited to Join an IKIMINA Group",
      smsTemplate: "You've been invited to join the {groupName} IKIMINA group. Click {inviteLink} to respond.",
    },
    newMemberJoined: {
      subject: 'New Member has Joined {groupName}',
      smsTemplate: '{memberName} has joined your IKIMINA group {groupName}.',
    }
  },
  
  // Notification priority levels
  priority: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
  },
  
  // Default settings for new users
  defaultUserSettings: {
    enableInApp: true,
    enableEmail: true,
    enableSMS: false, // Requires opt-in
    contributionReminders: true,
    loanReminders: true,
    groupUpdates: true,
    systemUpdates: true
  },
  
  // Notification service configuration
  service: {
    batchSize: parseInt(process.env.NOTIFICATION_BATCH_SIZE) || 50,
    retryAttempts: parseInt(process.env.NOTIFICATION_RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.NOTIFICATION_RETRY_DELAY) || 5000, // ms
    ttl: parseInt(process.env.NOTIFICATION_TTL) || 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  }
};

// Configure notification logging
const notificationLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'notification-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/notifications.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

module.exports = {
  config: notificationConfig,
  logger: notificationLogger
}; 