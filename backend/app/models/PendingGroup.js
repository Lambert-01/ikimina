const mongoose = require('mongoose');

const PendingGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a group name'],
    trim: true,
    maxlength: [100, 'Group name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a group description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  proposedManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  maxMembers: {
    type: Number,
    required: [true, 'Please specify maximum number of members'],
    min: [3, 'Minimum 3 members required'],
    max: [50, 'Maximum 50 members allowed']
  },
  contributionAmount: {
    type: Number,
    required: [true, 'Please specify contribution amount'],
    min: [1000, 'Minimum contribution is 1000 RWF']
  },
  contributionFrequency: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly'],
    required: [true, 'Please specify contribution frequency']
  },
  meetingFrequency: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly'],
    required: [true, 'Please specify meeting frequency']
  },
  meetingLocation: {
    type: String,
    required: [true, 'Please specify meeting location'],
    trim: true
  },
  loanInterestRate: {
    type: Number,
    required: [true, 'Please specify loan interest rate'],
    min: [0, 'Interest rate cannot be negative'],
    max: [50, 'Interest rate cannot exceed 50%']
  },
  maxLoanMultiplier: {
    type: Number,
    required: [true, 'Please specify maximum loan multiplier'],
    min: [1, 'Loan multiplier must be at least 1'],
    max: [10, 'Loan multiplier cannot exceed 10']
  },
  region: {
    type: String,
    required: [true, 'Please specify region'],
    enum: ['Kigali', 'Northern', 'Southern', 'Eastern', 'Western']
  },
  district: {
    type: String,
    required: [true, 'Please specify district'],
    trim: true
  },
  sector: {
    type: String,
    required: [true, 'Please specify sector'],
    trim: true
  },
  submissionNotes: {
    type: String,
    maxlength: [1000, 'Submission notes cannot exceed 1000 characters']
  },
  supportingDocuments: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'needs_clarification'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewNotes: {
    type: String,
    maxlength: [1000, 'Review notes cannot exceed 1000 characters']
  },
  reviewedAt: Date,
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  complianceChecks: {
    documentationComplete: {
      type: Boolean,
      default: false
    },
    managerVerified: {
      type: Boolean,
      default: false
    },
    locationVerified: {
      type: Boolean,
      default: false
    },
    rulesCompliant: {
      type: Boolean,
      default: false
    }
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

// Update lastModified on save
PendingGroupSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

// Method to check if group is ready for approval
PendingGroupSchema.methods.isReadyForApproval = function() {
  const { documentationComplete, managerVerified, locationVerified, rulesCompliant } = this.complianceChecks;
  return documentationComplete && managerVerified && locationVerified && rulesCompliant;
};

// Method to approve and convert to regular group
PendingGroupSchema.methods.approve = async function(adminId, notes) {
  this.status = 'approved';
  this.reviewedBy = adminId;
  this.reviewNotes = notes;
  this.reviewedAt = Date.now();
  
  await this.save();
  
  // This would trigger group creation in the main Groups collection
  return this;
};

// Method to reject group application
PendingGroupSchema.methods.reject = async function(adminId, reason) {
  this.status = 'rejected';
  this.reviewedBy = adminId;
  this.reviewNotes = reason;
  this.reviewedAt = Date.now();
  
  await this.save();
  return this;
};

module.exports = mongoose.model('PendingGroup', PendingGroupSchema);