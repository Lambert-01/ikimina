const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
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
  requestedAmount: {
    type: Number,
    required: [true, 'Requested loan amount is required'],
    min: [0, 'Loan amount cannot be negative']
  },
  approvedAmount: {
    type: Number,
    min: [0, 'Approved amount cannot be negative']
  },
  disbursedAmount: {
    type: Number,
    min: [0, 'Disbursed amount cannot be negative']
  },
  interestRate: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: [0, 'Interest rate cannot be negative']
  },
  interestType: {
    type: String,
    enum: ['simple', 'compound', 'reducing_balance'],
    default: 'simple'
  },
  interestCalculationPeriod: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'annually'],
    default: 'monthly'
  },
  estimatedInterestAmount: {
    type: Number
  },
  actualInterestPaid: {
    type: Number,
    default: 0
  },
  processingFee: {
    type: Number,
    default: 0
  },
  totalExpectedAmount: {
    type: Number
  },
  requestedDurationMonths: {
    type: Number,
    required: [true, 'Loan duration is required'],
    min: [1, 'Loan duration must be at least 1 month']
  },
  approvedDurationMonths: {
    type: Number,
    min: [1, 'Approved duration must be at least 1 month']
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: Date,
  disbursementDate: Date,
  startDate: Date,
  dueDate: Date,
  closedDate: Date,
  purpose: {
    type: String,
    required: [true, 'Loan purpose is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: [
      'pending',     // Awaiting approval
      'approved',    // Approved but not disbursed
      'rejected',    // Rejected by group/admin
      'disbursed',   // Money transferred to borrower
      'active',      // Repayment in progress
      'completed',   // Fully repaid
      'defaulted',   // Past due with no payment
      'written_off', // Acknowledged as a loss
      'canceled'     // Canceled before disbursement
    ],
    default: 'pending'
  },
  approvalWorkflow: {
    requiredApprovals: {
      type: Number,
      default: 0
    },
    receivedApprovals: {
      type: Number,
      default: 0
    },
    votingDeadline: Date,
    votingStarted: Date
  },
  votes: [{
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['approve', 'reject', 'abstain'],
      required: true
    },
    comment: String,
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rejectionReason: {
    type: String,
    trim: true
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  amountPaid: {
    type: Number,
    default: 0
  },
  principalPaid: {
    type: Number,
    default: 0
  },
  interestPaid: {
    type: Number,
    default: 0
  },
  feesPaid: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    default: function() {
      return this.approvedAmount ? this.approvedAmount : 0;
    }
  },
  paymentFrequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'quarterly'],
    default: 'monthly'
  },
  expectedPayments: {
    count: {
      type: Number,
      default: function() {
        return this.approvedDurationMonths || this.requestedDurationMonths || 1;
      }
    },
    amount: {
      type: Number
    },
    nextDueDate: Date
  },
  paymentSchedule: [{
    paymentNumber: Number,
    dueDate: Date,
    expectedAmount: {
      total: Number,
      principal: Number,
      interest: Number,
      fees: Number
    },
    paidAmount: {
      total: {
        type: Number,
        default: 0
      },
      principal: {
        type: Number,
        default: 0
      },
      interest: {
        type: Number,
        default: 0
      },
      fees: {
        type: Number,
        default: 0
      }
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue', 'waived'],
      default: 'pending'
    },
    paidDate: Date,
    transactions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }],
    lateFee: {
      type: Number,
      default: 0
    },
    daysLate: {
      type: Number,
      default: 0
    },
    notes: String
  }],
  latePayments: {
    count: {
      type: Number,
      default: 0
    },
    totalLateFees: {
      type: Number,
      default: 0
    }
  },
  lastPayment: {
    amount: Number,
    date: Date,
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  },
  guarantors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approved: {
      type: Boolean,
      default: false
    },
    approvedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
    guaranteedAmount: {
      type: Number
    },
    guaranteePercentage: {
      type: Number
    },
    relationship: String,
    notes: String
  }],
  collateral: [{
    type: {
      type: String,
      enum: ['property', 'vehicle', 'savings', 'asset', 'other']
    },
    description: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    proofDocuments: [{
      type: String, // URL or file path
      description: String
    }],
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  }],
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  gracePeriodDays: {
    type: Number,
    default: 0
  },
  lateFeePercentage: {
    type: Number,
    default: 0
  },
  reminders: [{
    type: {
      type: String,
      enum: ['upcoming_payment', 'payment_due', 'payment_overdue', 'loan_completion'],
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    channel: {
      type: String,
      enum: ['sms', 'email', 'push', 'in_app'],
      required: true
    },
    message: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    }
  }],
  disbursement: {
    method: {
      type: String,
      enum: ['mobile_money', 'bank_transfer', 'cash', 'other']
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    reference: String,
    disbursedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['application', 'approval', 'agreement', 'id', 'proof_of_income', 'other']
    },
    url: String,
    name: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  adminNotes: {
    type: String,
    trim: true
  },
  privateBorrowerNotes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  currency: {
    type: String,
    default: 'RWF'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

LoanSchema.index({ user: 1, group: 1, status: 1 });
LoanSchema.index({ group: 1, status: 1 });
LoanSchema.index({ dueDate: 1, status: 1 });
LoanSchema.index({ 'guarantors.user': 1 });
LoanSchema.index({ status: 1, createdAt: -1 });
LoanSchema.index({ status: 1, dueDate: 1 });
LoanSchema.index({ 'paymentSchedule.dueDate': 1, status: 1 });

LoanSchema.pre('save', function(next) {
  if (this.approvedAmount && this.interestRate && !this.estimatedInterestAmount) {
    const principal = this.approvedAmount;
    const rate = this.interestRate / 100;
    const duration = this.approvedDurationMonths || this.requestedDurationMonths;
    
    this.estimatedInterestAmount = principal * rate * (duration / 12);
    
    this.totalExpectedAmount = principal + this.estimatedInterestAmount + this.processingFee;
  }
  
  if (this.totalExpectedAmount && !this.remainingAmount) {
    this.remainingAmount = this.totalExpectedAmount;
  }
  
  if (this.amountPaid >= this.totalExpectedAmount && this.status === 'active') {
    this.status = 'completed';
    this.closedDate = new Date();
  }
  
  next();
});

LoanSchema.virtual('paymentProgress').get(function() {
  if (!this.totalExpectedAmount || this.totalExpectedAmount === 0) return 0;
  return Math.min(100, ((this.amountPaid / this.totalExpectedAmount) * 100).toFixed(2));
});

LoanSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'active' && this.status !== 'disbursed') return false;
  
  const now = new Date();
  const nextPayment = this.paymentSchedule.find(p => p.status === 'pending' || p.status === 'partial');
  
  if (!nextPayment) return false;
  
  const dueDateWithGrace = new Date(nextPayment.dueDate);
  dueDateWithGrace.setDate(dueDateWithGrace.getDate() + (this.gracePeriodDays || 0));
  
  return now > dueDateWithGrace;
});

LoanSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  
  const now = new Date();
  const nextPayment = this.paymentSchedule.find(p => p.status === 'pending' || p.status === 'partial');
  
  if (!nextPayment) return 0;
  
  const dueDateWithGrace = new Date(nextPayment.dueDate);
  dueDateWithGrace.setDate(dueDateWithGrace.getDate() + (this.gracePeriodDays || 0));
  
  const diffTime = Math.abs(now - dueDateWithGrace);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

LoanSchema.methods.generatePaymentSchedule = function() {
  if (!this.approvedAmount || !this.approvedDurationMonths || !this.paymentFrequency) {
    return false;
  }
  
  const schedule = [];
  const totalAmount = this.totalExpectedAmount;
  const numPayments = this.getNumberOfPayments();
  const paymentAmount = parseFloat((totalAmount / numPayments).toFixed(2));
  let startDate = this.startDate || new Date();
  let remainingAmount = totalAmount;
  
  const totalPrincipal = this.approvedAmount;
  const totalInterest = this.estimatedInterestAmount;
  const principalPerPayment = parseFloat((totalPrincipal / numPayments).toFixed(2));
  const interestPerPayment = parseFloat((totalInterest / numPayments).toFixed(2));
  
  for (let i = 0; i < numPayments; i++) {
    let dueDate = new Date(startDate);
    
    switch (this.paymentFrequency) {
      case 'weekly':
        dueDate.setDate(dueDate.getDate() + (7 * (i + 1)));
        break;
      case 'biweekly':
        dueDate.setDate(dueDate.getDate() + (14 * (i + 1)));
        break;
      case 'monthly':
        dueDate.setMonth(dueDate.getMonth() + (i + 1));
        break;
      case 'quarterly':
        dueDate.setMonth(dueDate.getMonth() + (3 * (i + 1)));
        break;
    }
    
    const isLastPayment = i === numPayments - 1;
    const paymentTotal = isLastPayment ? remainingAmount : paymentAmount;
    
    schedule.push({
      paymentNumber: i + 1,
      dueDate: dueDate,
      expectedAmount: {
        total: paymentTotal,
        principal: isLastPayment ? remainingAmount - (interestPerPayment + (this.processingFee / numPayments)) : principalPerPayment,
        interest: interestPerPayment,
        fees: this.processingFee / numPayments
      },
      status: 'pending'
    });
    
    remainingAmount -= paymentAmount;
  }
  
  this.paymentSchedule = schedule;
  
  if (schedule.length > 0) {
    this.expectedPayments = {
      count: schedule.length,
      amount: paymentAmount,
      nextDueDate: schedule[0].dueDate
    };
  }
  
  return this.save();
};

LoanSchema.methods.getNumberOfPayments = function() {
  const durationMonths = this.approvedDurationMonths || this.requestedDurationMonths;
  
  switch (this.paymentFrequency) {
    case 'weekly':
      return Math.ceil(durationMonths * 4.33);
    case 'biweekly':
      return Math.ceil(durationMonths * 2.17);
    case 'quarterly':
      return Math.ceil(durationMonths / 3);
    case 'monthly':
    default:
      return durationMonths;
  }
};

LoanSchema.methods.recordPayment = function(amount, transactionId, paymentDate = new Date()) {
  let paymentToUpdate = this.paymentSchedule.find(p => p.status === 'pending' || p.status === 'partial');
  
  if (!paymentToUpdate) {
    return {
      success: false,
      message: 'No pending payments found'
    };
  }
  
  const remaining = paymentToUpdate.expectedAmount.total - (paymentToUpdate.paidAmount?.total || 0);
  
  paymentToUpdate.paidAmount = paymentToUpdate.paidAmount || {
    total: 0,
    principal: 0,
    interest: 0,
    fees: 0
  };
  
  if (amount >= remaining) {
    const excess = amount - remaining;
    
    paymentToUpdate.paidAmount.total += remaining;
    
    const totalExpected = paymentToUpdate.expectedAmount.total;
    const principalRatio = paymentToUpdate.expectedAmount.principal / totalExpected;
    const interestRatio = paymentToUpdate.expectedAmount.interest / totalExpected;
    const feesRatio = paymentToUpdate.expectedAmount.fees / totalExpected;
    
    paymentToUpdate.paidAmount.principal += remaining * principalRatio;
    paymentToUpdate.paidAmount.interest += remaining * interestRatio;
    paymentToUpdate.paidAmount.fees += remaining * feesRatio;
    
    paymentToUpdate.status = 'paid';
    paymentToUpdate.paidDate = paymentDate;
    
    if (transactionId && !paymentToUpdate.transactions.includes(transactionId)) {
      paymentToUpdate.transactions.push(transactionId);
    }
    
    if (excess > 0) {
      const nextPaymentIndex = this.paymentSchedule.findIndex(p => 
        p.paymentNumber > paymentToUpdate.paymentNumber && 
        (p.status === 'pending' || p.status === 'partial')
      );
      
      if (nextPaymentIndex !== -1) {
        const remainingResult = this.recordPayment(excess, transactionId, paymentDate);
        if (!remainingResult.success) {
          return {
            success: true,
            message: 'Payment recorded, but excess could not be applied: ' + remainingResult.message,
            paymentNumber: paymentToUpdate.paymentNumber,
            appliedAmount: remaining,
            excess: excess
          };
        }
      }
    }
    
  } else {
    paymentToUpdate.paidAmount.total += amount;
    
    const totalExpected = paymentToUpdate.expectedAmount.total;
    const principalRatio = paymentToUpdate.expectedAmount.principal / totalExpected;
    const interestRatio = paymentToUpdate.expectedAmount.interest / totalExpected;
    const feesRatio = paymentToUpdate.expectedAmount.fees / totalExpected;
    
    paymentToUpdate.paidAmount.principal += amount * principalRatio;
    paymentToUpdate.paidAmount.interest += amount * interestRatio;
    paymentToUpdate.paidAmount.fees += amount * feesRatio;
    
    paymentToUpdate.status = 'partial';
    
    if (transactionId && !paymentToUpdate.transactions.includes(transactionId)) {
      paymentToUpdate.transactions.push(transactionId);
    }
  }
  
  this.amountPaid = (this.amountPaid || 0) + amount;
  this.principalPaid = (this.principalPaid || 0) + (amount * (paymentToUpdate.expectedAmount.principal / paymentToUpdate.expectedAmount.total));
  this.interestPaid = (this.interestPaid || 0) + (amount * (paymentToUpdate.expectedAmount.interest / paymentToUpdate.expectedAmount.total));
  this.feesPaid = (this.feesPaid || 0) + (amount * (paymentToUpdate.expectedAmount.fees / paymentToUpdate.expectedAmount.total));
  
  this.remainingAmount = Math.max(0, this.totalExpectedAmount - this.amountPaid);
  
  this.lastPayment = {
    amount: amount,
    date: paymentDate,
    transaction: transactionId
  };
  
  if (this.amountPaid >= this.totalExpectedAmount) {
    this.status = 'completed';
    this.closedDate = paymentDate;
  }
  
  const nextPending = this.paymentSchedule.find(p => p.status === 'pending' || p.status === 'partial');
  if (nextPending) {
    this.expectedPayments.nextDueDate = nextPending.dueDate;
  } else {
    this.expectedPayments.nextDueDate = undefined;
  }
  
  return {
    success: true,
    message: 'Payment recorded successfully',
    paymentNumber: paymentToUpdate.paymentNumber,
    appliedAmount: Math.min(amount, remaining),
    excess: amount > remaining ? amount - remaining : 0
  };
};

LoanSchema.methods.updatePaymentStatuses = function() {
  const today = new Date();
  let overdueDays = 0;
  
  this.paymentSchedule.forEach(payment => {
    if ((payment.status === 'pending' || payment.status === 'partial') && new Date(payment.dueDate) < today) {
      payment.daysLate = Math.ceil((today - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24));
      
      if (payment.daysLate > (this.gracePeriodDays || 0)) {
        payment.status = 'overdue';
        
        if (this.lateFeePercentage > 0 && !payment.lateFee) {
          payment.lateFee = (payment.expectedAmount.total * (this.lateFeePercentage / 100));
          
          this.totalExpectedAmount = (this.totalExpectedAmount || 0) + payment.lateFee;
          this.remainingAmount = (this.remainingAmount || 0) + payment.lateFee;
          
          this.latePayments.count = (this.latePayments.count || 0) + 1;
          this.latePayments.totalLateFees = (this.latePayments.totalLateFees || 0) + payment.lateFee;
        }
        
        overdueDays = Math.max(overdueDays, payment.daysLate);
      }
    }
  });
  
  if (overdueDays >= 30 && this.status === 'active') {
    this.status = 'defaulted';
  }
  
  return this.save();
};

LoanSchema.methods.recordVote = function(userId, voteType, comment) {
  const existingVoteIndex = this.votes.findIndex(v => v.voter.toString() === userId.toString());
  
  if (existingVoteIndex !== -1) {
    this.votes[existingVoteIndex].vote = voteType;
    this.votes[existingVoteIndex].comment = comment;
    this.votes[existingVoteIndex].votedAt = new Date();
  } else {
    this.votes.push({
      voter: userId,
      vote: voteType,
      comment: comment,
      votedAt: new Date()
    });
  }
  
  const approvals = this.votes.filter(v => v.vote === 'approve').length;
  this.approvalWorkflow.receivedApprovals = approvals;
  
  return this.save();
};

LoanSchema.methods.calculateVoteResults = function(requiredApprovalPercentage = 50) {
  if (this.status !== 'pending') {
    return {
      success: false,
      message: 'Loan is not in pending status'
    };
  }
  
  if (!this.votes || this.votes.length === 0) {
    return {
      success: false,
      message: 'No votes recorded'
    };
  }
  
  const totalVotes = this.votes.filter(v => v.vote !== 'abstain').length;
  const approvalVotes = this.votes.filter(v => v.vote === 'approve').length;
  const rejectionVotes = this.votes.filter(v => v.vote === 'reject').length;
  
  if (totalVotes === 0) {
    return {
      success: false,
      message: 'No valid votes (excluding abstentions)'
    };
  }
  
  const approvalPercentage = (approvalVotes / totalVotes) * 100;
  
  const isApproved = approvalPercentage >= requiredApprovalPercentage;
  
  return {
    success: true,
    isApproved: isApproved,
    approvalPercentage: approvalPercentage,
    totalVotes: totalVotes,
    approvalVotes: approvalVotes,
    rejectionVotes: rejectionVotes
  };
};

module.exports = mongoose.model('Loan', LoanSchema); 