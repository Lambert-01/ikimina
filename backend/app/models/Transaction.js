const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['contribution', 'loan_disbursement', 'loan_repayment', 'fee', 'penalty', 'withdrawal', 'transfer', 'other'],
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'RWF'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  sender: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    accountType: {
      type: String,
      enum: ['user', 'group', 'system', 'external'],
      default: 'user'
    }
  },
  recipient: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    },
    name: String,
    accountType: {
      type: String,
      enum: ['user', 'group', 'system', 'external'],
      default: 'group'
    }
  },
  paymentMethod: {
    type: String,
    enum: ['mobile_money', 'cash', 'bank_transfer', 'system', 'other'],
    default: 'mobile_money'
  },
  paymentProvider: {
    type: String,
    enum: ['MTN', 'Airtel', 'bank', 'cash', 'system', 'other'],
    default: 'MTN'
  },
  paymentProviderReference: {
    type: String
  },
  transactionReference: {
    type: String,
    unique: true
  },
  fees: {
    amount: {
      type: Number,
      default: 0
    },
    description: String
  },
  relatedEntities: {
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
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  notes: {
    type: String
  },
  receipt: {
    url: String,
    generatedAt: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  failureReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate transaction reference before saving
TransactionSchema.pre('save', function(next) {
  if (this.isNew && !this.transactionReference) {
    const timestamp = Date.now().toString();
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.transactionReference = `TXN-${timestamp.slice(-6)}-${randomStr}`;
  }
  
  next();
});

// Method to mark transaction as completed
TransactionSchema.methods.markAsCompleted = function(processedBy) {
  this.status = 'completed';
  this.processedAt = new Date();
  
  if (processedBy) {
    this.processedBy = processedBy;
  }
  
  return this.save();
};

// Method to mark transaction as failed
TransactionSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.processedAt = new Date();
  return this.save();
};

// Method to cancel transaction
TransactionSchema.methods.cancel = function(reason) {
  if (this.status === 'completed') {
    throw new Error('Cannot cancel a completed transaction');
  }
  
  this.status = 'cancelled';
  this.failureReason = reason;
  this.processedAt = new Date();
  return this.save();
};

// Method to refund transaction
TransactionSchema.methods.refund = function(reason) {
  if (this.status !== 'completed') {
    throw new Error('Only completed transactions can be refunded');
  }
  
  this.status = 'refunded';
  this.notes = reason;
  return this.save();
};

// Virtual for total amount (including fees)
TransactionSchema.virtual('totalAmount').get(function() {
  return this.amount + (this.fees ? this.fees.amount : 0);
});

// Virtual for receipt number
TransactionSchema.virtual('receiptNumber').get(function() {
  return this.transactionReference;
});

// Indexes for faster queries
TransactionSchema.index({ 'sender.user': 1, createdAt: -1 });
TransactionSchema.index({ 'recipient.user': 1, createdAt: -1 });
TransactionSchema.index({ 'recipient.group': 1, createdAt: -1 });
TransactionSchema.index({ transactionReference: 1 });
TransactionSchema.index({ status: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);

