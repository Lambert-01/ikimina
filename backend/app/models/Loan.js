const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [0, 'Loan amount must be positive']
  },
  interestRate: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: [0, 'Interest rate must be positive']
  },
  interestAmount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  outstandingAmount: {
    type: Number,
    required: true
  },
  durationMonths: {
    type: Number,
    required: [true, 'Loan duration is required'],
    min: [1, 'Loan duration must be at least 1 month']
  },
  purpose: {
    type: String,
    required: [true, 'Loan purpose is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'disbursed', 'paid', 'defaulted'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  disbursedAt: {
    type: Date
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentSchedule: [{
    dueDate: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending'
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    paidAt: {
      type: Date
    }
  }],
  payments: [{
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['cash', 'mobile_money', 'bank_transfer', 'other'],
      default: 'mobile_money'
    },
    reference: {
      type: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate interest amount, total amount, and outstanding amount before saving
LoanSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('amount') || this.isModified('interestRate') || this.isModified('durationMonths')) {
    this.interestAmount = (this.amount * this.interestRate * this.durationMonths) / 100;
    this.totalAmount = this.amount + this.interestAmount;
    
    // If it's a new loan or amount/interest was modified, reset outstanding amount
    if (this.isNew || this.isModified('amount') || this.isModified('interestRate')) {
      this.outstandingAmount = this.totalAmount;
    }
    
    // Calculate due date based on duration
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + this.durationMonths);
    this.dueDate = dueDate;
    
    // Generate payment schedule if it's a new loan
    if (this.isNew) {
      this.generatePaymentSchedule();
    }
  }
  
  next();
});

// Method to generate payment schedule
LoanSchema.methods.generatePaymentSchedule = function() {
  const schedule = [];
  const monthlyPayment = this.totalAmount / this.durationMonths;
  
  for (let i = 0; i < this.durationMonths; i++) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    
    schedule.push({
      dueDate,
      amount: monthlyPayment,
      status: 'pending',
      paidAmount: 0
    });
  }
  
  this.paymentSchedule = schedule;
};

// Method to record a payment
LoanSchema.methods.recordPayment = function(amount, method, reference) {
  // Add to payments array
  this.payments.push({
    amount,
    date: new Date(),
    method,
    reference
  });
  
  // Update outstanding amount
  this.outstandingAmount -= amount;
  
  // If fully paid, update status
  if (this.outstandingAmount <= 0) {
    this.status = 'paid';
    this.outstandingAmount = 0;
  }
  
  // Update payment schedule
  let remainingPayment = amount;
  
  for (const payment of this.paymentSchedule) {
    if (payment.status === 'pending' && remainingPayment > 0) {
      const amountToPay = Math.min(payment.amount - payment.paidAmount, remainingPayment);
      
      payment.paidAmount += amountToPay;
      remainingPayment -= amountToPay;
      
      if (payment.paidAmount >= payment.amount) {
        payment.status = 'paid';
        payment.paidAt = new Date();
      }
    }
  }
};

module.exports = mongoose.model('Loan', LoanSchema); 