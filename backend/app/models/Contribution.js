const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema({
  contributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Contributor is required']
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group is required']
  },
  amount: {
    type: Number,
    required: [true, 'Contribution amount is required'],
    min: [100, 'Contribution amount must be at least 100 RWF']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  contributionDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  isLate: {
    type: Boolean,
    default: false
  },
  lateFee: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'mobile_money', 'bank_transfer', 'other'],
    default: 'mobile_money'
  },
  transactionReference: {
    type: String
  },
  paymentProvider: {
    type: String,
    enum: ['MTN', 'Airtel', 'bank', 'cash', 'other'],
    default: 'MTN'
  },
  paymentProviderReference: {
    type: String
  },
  paymentDate: {
    type: Date
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  cycle: {
    number: {
      type: Number,
      default: 1
    },
    startDate: Date,
    endDate: Date
  },
  receipt: {
    url: String,
    generatedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate total amount before saving
ContributionSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('lateFee')) {
    this.totalAmount = this.amount + this.lateFee;
  }
  
  // Check if contribution is late
  if (this.isModified('contributionDate') || this.isModified('dueDate')) {
    this.isLate = new Date(this.contributionDate) > new Date(this.dueDate);
  }
  
  next();
});

// Method to mark contribution as completed
ContributionSchema.methods.markAsCompleted = function(paymentDetails) {
  this.status = 'completed';
  this.paymentDate = new Date();
  
  if (paymentDetails) {
    if (paymentDetails.method) this.paymentMethod = paymentDetails.method;
    if (paymentDetails.reference) this.transactionReference = paymentDetails.reference;
    if (paymentDetails.provider) this.paymentProvider = paymentDetails.provider;
    if (paymentDetails.providerReference) this.paymentProviderReference = paymentDetails.providerReference;
    if (paymentDetails.recordedBy) this.recordedBy = paymentDetails.recordedBy;
    if (paymentDetails.notes) this.notes = paymentDetails.notes;
  }
  
  return this.save();
};

// Method to mark contribution as failed
ContributionSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  if (reason) this.notes = reason;
  return this.save();
};

// Method to refund contribution
ContributionSchema.methods.refund = function(reason) {
  this.status = 'refunded';
  if (reason) this.notes = reason;
  return this.save();
};

// Method to apply late fee
ContributionSchema.methods.applyLateFee = function(amount) {
  this.lateFee = amount;
  this.totalAmount = this.amount + this.lateFee;
  return this.save();
};

// Virtual for days late
ContributionSchema.virtual('daysLate').get(function() {
  if (!this.isLate) return 0;
  
  const dueDate = new Date(this.dueDate);
  const contributionDate = new Date(this.contributionDate);
  const diffTime = Math.abs(contributionDate - dueDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Virtual for receipt number
ContributionSchema.virtual('receiptNumber').get(function() {
  return `CNT-${this._id.toString().slice(-8).toUpperCase()}`;
});

module.exports = mongoose.model('Contribution', ContributionSchema); 