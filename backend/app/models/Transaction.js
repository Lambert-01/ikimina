const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  // Transaction type
  type: {
    type: String,
    enum: [
      'contribution',       // Regular IKIMINA contribution
      'loan_disbursement',  // Money given to a borrower
      'loan_repayment',     // Repayment towards a loan
      'payout',             // Rotational or lottery payout to member
      'fine',               // Penalty payment
      'fee',                // Service or membership fee
      'interest',           // Interest payment or earning
      'withdrawal',         // Admin withdrawal
      'deposit',            // Additional deposit (not regular contribution)
      'refund',             // Refund to member
      'adjustment'          // Manual adjustment by admin
    ],
    required: [true, 'Transaction type is required']
  },
  
  // Financial details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  
  // Transaction fee (if any)
  fee: {
    amount: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      enum: ['fixed', 'percentage', 'none'],
      default: 'none'
    }
  },
  
  // Net amount after fees
  netAmount: {
    type: Number,
    default: function() {
      return this.amount - this.fee.amount;
    }
  },
  
  // Parties involved
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group is required']
  },
  
  // Related records
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan'
  },
  
  contributionCycle: {
    number: Number,
    dueDate: Date
  },
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['mobile_money', 'cash', 'bank_transfer', 'system', 'other'],
    default: 'mobile_money'
  },
  
  paymentProvider: {
    type: String,
    enum: ['MTN', 'Airtel', 'bank', 'manual', 'system', 'other', null],
    default: null
  },
  
  // Payment status tracking
  paymentStatus: {
    type: String,
    enum: [
      'initiated',    // Transaction has been started
      'pending',      // Waiting for confirmation
      'processing',   // Being processed by payment provider
      'completed',    // Successfully processed
      'failed',       // Failed to process
      'canceled',     // Canceled by user or system
      'refunded'      // Money returned to sender
    ],
    default: 'initiated'
  },
  
  // Mobile money specific fields
  mobileMoneyDetails: {
    phoneNumber: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\+?250\d{9}$/.test(v);
        },
        message: props => `${props.value} is not a valid Rwandan phone number!`
      }
    },
    transactionId: String,
    operatorReference: String,
    senderName: String,
    receiverName: String,
    requestId: String,
    callbackData: mongoose.Schema.Types.Mixed
  },
  
  // Bank transfer details
  bankDetails: {
    accountNumber: String,
    bankName: String,
    referenceNumber: String,
    accountName: String
  },
  
  // Transaction identifiers
  referenceNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  
  externalReferenceId: {
    type: String,
    index: true,
    sparse: true
  },
  
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  canceledAt: Date,
  
  // Tracking and verification
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  verificationCode: String,
  verificationExpiry: Date,
  verifiedAt: Date,
  isManualEntry: {
    type: Boolean,
    default: false
  },
  
  // Notes and metadata
  description: {
    type: String,
    trim: true
  },
  
  notes: {
    type: String,
    trim: true
  },
  
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Financial impact tracking
  previousBalance: Number,
  newBalance: Number,
  
  // Receipt tracking
  receiptGenerated: {
    type: Boolean,
    default: false
  },
  
  receiptNumber: String,
  receiptUrl: String,
  
  // Currency
  currency: {
    type: String,
    default: 'RWF'
  },
  
  // For failed transactions, record retry attempts
  retryAttempts: {
    type: Number,
    default: 0
  },
  
  maxRetryAttempts: {
    type: Number,
    default: 3
  },
  
  retryHistory: [{
    attemptedAt: Date,
    status: String,
    error: mongoose.Schema.Types.Mixed
  }],
  
  // Error tracking
  error: {
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  },
  
  // Audit trail
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes for faster queries
TransactionSchema.index({ user: 1, group: 1, createdAt: -1 });
TransactionSchema.index({ group: 1, type: 1, paymentStatus: 1 });
TransactionSchema.index({ paymentStatus: 1, createdAt: -1 });
TransactionSchema.index({ referenceNumber: 1 }, { sparse: true });
TransactionSchema.index({ externalReferenceId: 1 }, { sparse: true });
TransactionSchema.index({ 'mobileMoneyDetails.transactionId': 1 }, { sparse: true });
TransactionSchema.index({ 'mobileMoneyDetails.operatorReference': 1 }, { sparse: true });
TransactionSchema.index({ loan: 1 }, { sparse: true });

// Generate reference number if not provided
TransactionSchema.pre('save', function(next) {
  if (!this.referenceNumber) {
    const prefix = this.type.substring(0, 3).toUpperCase();
    const timestamp = Math.floor(Date.now() / 1000).toString(36);
    const random = Math.floor(Math.random() * 1000).toString(36).padStart(3, '0');
    this.referenceNumber = `${prefix}-${timestamp}-${random}`.toUpperCase();
  }
  
  if (!this.receiptNumber && this.paymentStatus === 'completed') {
    // Generate receipt number based on transaction ID
    this.receiptNumber = `RCPT-${this._id.toString().slice(-8).toUpperCase()}`;
    this.receiptGenerated = true;
  }
  
  next();
});

// Virtual for transaction age in days
TransactionSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to mark transaction as completed
TransactionSchema.methods.markAsCompleted = function(userId) {
  this.paymentStatus = 'completed';
  this.completedAt = new Date();
  if (userId) this.verifiedBy = userId;
  return this.save();
};

// Method to mark transaction as failed
TransactionSchema.methods.markAsFailed = function(error) {
  this.paymentStatus = 'failed';
  this.failedAt = new Date();
  
  if (error) {
    this.error = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error occurred',
      details: error.details || {}
    };
  }
  
  return this.save();
};

// Method to retry a failed transaction
TransactionSchema.methods.retry = async function() {
  if (this.paymentStatus !== 'failed' || this.retryAttempts >= this.maxRetryAttempts) {
    return false;
  }
  
  // Save current state in retry history
  this.retryHistory.push({
    attemptedAt: this.failedAt || this.updatedAt,
    status: this.paymentStatus,
    error: this.error
  });
  
  // Reset for retry
  this.paymentStatus = 'initiated';
  this.retryAttempts += 1;
  this.error = undefined;
  this.failedAt = undefined;
  
  return this.save();
};

// Method to cancel transaction
TransactionSchema.methods.cancel = function(reason) {
  if (['completed', 'refunded'].includes(this.paymentStatus)) {
    return false;
  }
  
  this.paymentStatus = 'canceled';
  this.canceledAt = new Date();
  
  if (reason) {
    this.notes = this.notes ? `${this.notes}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
  }
  
  return this.save();
};

module.exports = mongoose.model('Transaction', TransactionSchema);

