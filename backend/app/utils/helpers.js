/**
 * Helper utility functions
 */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Notification = require('../models/Notification');
const logger = require('./logger');
const User = require('../models/User');

/**
 * Generate random string
 * @param {Number} length - Length of the random string
 * @returns {String} - Random string
 */
exports.generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash password
 * @param {String} password - Plain text password
 * @returns {Promise<String>} - Hashed password
 */
exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hashed password
 * @param {String} password - Plain text password
 * @param {String} hashedPassword - Hashed password from database
 * @returns {Promise<Boolean>} - True if password matches
 */
exports.comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate pagination data
 * @param {Number} page - Current page number
 * @param {Number} limit - Number of items per page
 * @param {Number} total - Total number of items
 * @returns {Object} - Pagination data
 */
exports.getPaginationData = (page, limit, total) => {
  const currentPage = parseInt(page, 10) || 1;
  const itemsPerPage = parseInt(limit, 10) || 10;
  const totalPages = Math.ceil(total / itemsPerPage);
  
  return {
    currentPage,
    itemsPerPage,
    totalItems: total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
};

/**
 * Format phone number to international format
 * @param {String} phoneNumber - Phone number to format
 * @param {String} countryCode - Country code (default: 250 for Rwanda)
 * @returns {String} - Formatted phone number
 */
exports.formatPhoneNumber = (phoneNumber, countryCode = '250') => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, '');
  
  // Remove country code if present
  if (cleaned.startsWith(countryCode)) {
    cleaned = cleaned.substring(countryCode.length);
  }
  
  // Add country code
  return `+${countryCode}${cleaned}`;
};

/**
 * Generate random 6-digit PIN
 * @returns {String} - 6-digit PIN
 */
exports.generatePIN = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Calculate loan interest
 * @param {Number} principal - Loan amount
 * @param {Number} rate - Interest rate in percentage
 * @param {Number} months - Loan term in months
 * @returns {Object} - Interest and total amount
 */
exports.calculateLoanInterest = (principal, rate, months) => {
  const interest = (principal * rate * months) / 100;
  const totalAmount = principal + interest;
  
  return {
    principal,
    interestRate: rate,
    interestAmount: interest,
    totalAmount,
    monthlyPayment: totalAmount / months
  };
};

/**
 * Create and save a notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Created notification
 */
exports.createNotification = async (notificationData) => {
  try {
    // Validate required fields
    if (!notificationData.recipient || !notificationData.title || !notificationData.message) {
      throw new Error('Missing required notification fields');
    }

    // Get user language preference for localization
    const user = await User.findById(notificationData.recipient);
    if (!user) {
      throw new Error(`User not found for notification: ${notificationData.recipient}`);
    }

    // Create notification
    const notification = await Notification.create({
      recipient: notificationData.recipient,
      group: notificationData.group,
      type: notificationData.type || 'system',
      title: notificationData.title,
      message: notificationData.message,
      status: 'unread',
      priority: notificationData.priority || 'normal',
      channels: notificationData.channels || ['in_app'],
      relatedTo: notificationData.relatedTo,
      language: user.language || 'rw',
      // Initialize delivery status for each channel
      deliveryStatus: notificationData.channels.map(channel => ({
        channel,
        status: 'queued'
      }))
    });

    logger.info(`Notification created for user ${notificationData.recipient}:`, {
      notificationId: notification._id,
      title: notification.title,
      channels: notification.channels
    });

    return notification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Send notification to a user through configured channels
 * @param {String} userId - User ID to send notification to
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of notification delivery attempts
 */
exports.sendNotification = async (userId, title, message, options = {}) => {
  try {
    // Get user preferences
    const user = await User.findById(userId);
    if (!user) {
      logger.error(`User not found for notification: ${userId}`);
      return { success: false, error: 'User not found' };
    }

    // Create in-app notification
    const notification = await Notification.create({
      userId,
      title,
      message,
      type: options.type || 'system',
      relatedId: options.relatedId,
      relatedModel: options.relatedModel,
      read: false
    });

    // Track delivery results
    const results = {
      inApp: { success: true, notificationId: notification._id },
      email: null,
      sms: null,
      push: null
    };

    // Send email if user has email notifications enabled
    if (user.notificationPreferences?.email && user.email) {
      try {
        // In a real implementation, this would use an email service
        logger.info(`Would send email to ${user.email}: ${title}`);
        results.email = { success: true };
      } catch (error) {
        logger.error(`Failed to send email notification to ${user.email}:`, error);
        results.email = { success: false, error: error.message };
      }
    }

    // Send SMS if user has SMS notifications enabled
    if (user.notificationPreferences?.sms && user.phone) {
      try {
        // In a real implementation, this would use an SMS service
        logger.info(`Would send SMS to ${user.phone}: ${title}`);
        results.sms = { success: true };
      } catch (error) {
        logger.error(`Failed to send SMS notification to ${user.phone}:`, error);
        results.sms = { success: false, error: error.message };
      }
    }

    // Send push notification if user has push notifications enabled
    if (user.notificationPreferences?.push && user.pushTokens?.length > 0) {
      try {
        // In a real implementation, this would use a push notification service
        logger.info(`Would send push notification to user ${userId}: ${title}`);
        results.push = { success: true };
      } catch (error) {
        logger.error(`Failed to send push notification to user ${userId}:`, error);
        results.push = { success: false, error: error.message };
      }
    }

    return {
      success: true,
      notification,
      deliveryResults: results
    };
  } catch (error) {
    logger.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calculate loan interest and payment schedule
 * @param {Object} loanData - Loan data
 * @returns {Object} Loan calculation results
 */
exports.calculateLoan = (loanData) => {
  const { amount, interestRate, duration, frequency } = loanData;
  
  // Calculate interest amount
  const interestAmount = (amount * interestRate * duration) / 100;
  
  // Calculate total amount to be repaid
  const totalAmount = amount + interestAmount;
  
  // Calculate payment schedule
  const paymentSchedule = [];
  const startDate = new Date(loanData.startDate || Date.now());
  
  // Determine interval in days based on frequency
  let intervalDays;
  switch (frequency) {
    case 'weekly':
      intervalDays = 7;
      break;
    case 'biweekly':
      intervalDays = 14;
      break;
    case 'monthly':
    default:
      intervalDays = 30;
      break;
  }
  
  // Create payment schedule
  const paymentsCount = frequency === 'weekly' ? duration * 4 : 
                        frequency === 'biweekly' ? duration * 2 : 
                        duration;
                        
  const paymentAmount = totalAmount / paymentsCount;
  
  for (let i = 0; i < paymentsCount; i++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + ((i + 1) * intervalDays));
    
    paymentSchedule.push({
      dueDate,
      amount: i === paymentsCount - 1 ? 
        // Make sure the last payment accounts for any rounding errors
        totalAmount - (paymentAmount * (paymentsCount - 1)) :
        paymentAmount,
      status: 'pending',
      paidAmount: 0
    });
  }
  
  return {
    interestAmount,
    totalAmount,
    paymentSchedule,
    monthlyPayment: frequency === 'monthly' ? paymentAmount : undefined,
    nextPaymentDue: paymentSchedule[0]?.dueDate
  };
};

/**
 * Generate a unique group code
 * @param {Number} length - Length of code (default 6)
 * @returns {String} Unique alphanumeric code
 */
exports.generateGroupCode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return code;
};

/**
 * Format currency in RWF
 * @param {Number} amount - Amount to format
 * @returns {String} Formatted amount
 */
exports.formatCurrency = (amount) => {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Calculate next meeting date based on frequency and day
 * @param {Object} meetingConfig - Meeting configuration
 * @returns {Date} Next meeting date
 */
exports.calculateNextMeeting = (meetingConfig) => {
  const { frequency, day, time } = meetingConfig;
  const now = new Date();
  
  // Get day of week index (0 = Sunday, 1 = Monday, etc.)
  const dayIndex = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  }[day.toLowerCase()];
  
  if (dayIndex === undefined) {
    throw new Error(`Invalid meeting day: ${day}`);
  }
  
  // Calculate days until next meeting
  let daysUntilNext = (dayIndex - now.getDay() + 7) % 7;
  
  // If it's the same day but time has passed, go to next week
  if (daysUntilNext === 0) {
    const [hours, minutes] = (time || '12:00').split(':').map(Number);
    const meetingTime = new Date(now);
    meetingTime.setHours(hours, minutes, 0, 0);
    
    if (now > meetingTime) {
      daysUntilNext = 7;
    }
  }
  
  // Create the next meeting date
  const nextMeeting = new Date(now);
  nextMeeting.setDate(now.getDate() + daysUntilNext);
  
  // Set time if provided
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    nextMeeting.setHours(hours, minutes, 0, 0);
  } else {
    nextMeeting.setHours(12, 0, 0, 0); // Default to noon
  }
  
  // Adjust based on frequency
  if (frequency === 'biweekly') {
    // If the last meeting was less than 14 days ago, add another week
    // This would require storing the last meeting date
    // For now, just keeping it as the next occurrence of the specified day
  } else if (frequency === 'monthly') {
    // Set to the same day next month
    nextMeeting.setMonth(nextMeeting.getMonth() + 1);
  }
  
  return nextMeeting;
};

/**
 * Check if a user is a member of a group
 * @param {String} userId - User ID
 * @param {String} groupId - Group ID
 * @returns {Promise<Boolean>} True if user is member
 */
exports.isGroupMember = async (userId, groupId) => {
  try {
    const group = await require('../models/Group').findById(groupId);
    if (!group) return false;
    
    return group.members.some(member => 
      member.user.toString() === userId && member.status === 'active'
    );
  } catch (error) {
    logger.error('Error checking group membership:', error);
    return false;
  }
};

/**
 * Sanitize and validate phone number format
 * @param {String} phoneNumber - Phone number to validate
 * @returns {Object} Validation result with formatted number if valid
 */
exports.validatePhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Check for Rwandan number (should be 10-12 digits)
  if (/^(250)?\d{9}$/.test(digits)) {
    // Ensure it has the 250 prefix
    const formatted = digits.length === 9 ? `250${digits}` : digits;
    return {
      isValid: true,
      formatted,
      provider: formatted.startsWith('25078') ? 'mtn' : 
                formatted.startsWith('25073') ? 'airtel' : 
                'other'
    };
  }
  
  return { isValid: false };
};

/**
 * Get date ranges for reporting
 * @param {String} period - Period type (week, month, quarter, year)
 * @returns {Object} Start and end dates
 */
exports.getDateRange = (period) => {
  const now = new Date();
  let startDate, endDate = now;
  
  switch(period) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'ytd': // Year to date
      startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30); // Default to 30 days
  }
  
  return { startDate, endDate };
};

module.exports = exports; 