const mongoose = require('mongoose');

// Schema for storing payment provider configurations and transaction logs
const PaymentProviderSchema = new mongoose.Schema({
  // Provider identification
  name: {
    type: String,
    required: [true, 'Provider name is required'],
    enum: ['MTN', 'Airtel', 'Flutterwave', 'Manual', 'Other'],
    unique: true
  },
  
  code: {
    type: String,
    required: [true, 'Provider code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  // Provider status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Provider type
  type: {
    type: String,
    enum: ['mobile_money', 'payment_aggregator', 'bank', 'manual', 'other'],
    required: [true, 'Provider type is required']
  },
  
  // API configuration
  apiConfig: {
    baseUrl: String,
    version: String,
    primaryKey: String,
    secondaryKey: String,
    username: String,
    password: String,
    merchantId: String,
    webhook: {
      url: String,
      secret: String,
      enabled: {
        type: Boolean,
        default: true
      }
    },
    environment: {
      type: String,
      enum: ['sandbox', 'production', 'test'],
      default: 'sandbox'
    },
    headers: mongoose.Schema.Types.Mixed,
    timeout: {
      type: Number,
      default: 30000 // 30 seconds
    }
  },
  
  // Fee structure
  fees: {
    fixedFee: {
      type: Number,
      default: 0
    },
    percentageFee: {
      type: Number,
      default: 0
    },
    minimumFee: {
      type: Number,
      default: 0
    },
    maximumFee: {
      type: Number,
      default: 0
    }
  },
  
  // Transaction limits
  limits: {
    minAmount: {
      type: Number,
      default: 100
    },
    maxAmount: {
      type: Number,
      default: 2000000
    },
    dailyLimit: {
      type: Number,
      default: 5000000
    },
    monthlyLimit: {
      type: Number,
      default: 10000000
    },
    perTransactionLimit: {
      type: Number,
      default: 2000000
    }
  },
  
  // Service availability
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    lastDowntime: Date,
    scheduledMaintenance: {
      start: Date,
      end: Date,
      message: String
    },
    uptime: {
      type: Number, // Percentage
      default: 100
    }
  },
  
  // Processing settings
  processingConfig: {
    autoConfirmation: {
      type: Boolean,
      default: false
    },
    callbackUrl: String,
    callbackTimeout: {
      type: Number,
      default: 3600000 // 1 hour
    },
    retryPolicy: {
      maxAttempts: {
        type: Number,
        default: 3
      },
      retryInterval: {
        type: Number,
        default: 300000 // 5 minutes
      },
      backoffMultiplier: {
        type: Number,
        default: 2
      }
    },
    notifyOnFailure: {
      type: Boolean,
      default: true
    },
    notificationEmails: [String],
    notificationPhones: [String]
  },
  
  // Provider account details
  accountDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    swiftCode: String,
    iban: String,
    currency: {
      type: String,
      default: 'RWF'
    },
    country: {
      type: String,
      default: 'Rwanda'
    }
  },
  
  // Contact information
  contactInfo: {
    supportEmail: String,
    supportPhone: String,
    technicalContactName: String,
    technicalContactEmail: String,
    technicalContactPhone: String,
    website: String,
    apiDocsUrl: String
  },
  
  // Status logs
  statusLogs: [{
    status: {
      type: String,
      enum: ['operational', 'degraded', 'outage', 'maintenance'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    message: String,
    duration: Number, // minutes
    affectedServices: [String]
  }],
  
  // API key rotation
  keyRotation: {
    lastRotation: Date,
    nextScheduledRotation: Date,
    rotationFrequencyDays: {
      type: Number,
      default: 90
    },
    autoRotate: {
      type: Boolean,
      default: false
    }
  },
  
  // Meta data
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for faster queries
PaymentProviderSchema.index({ name: 1 });
PaymentProviderSchema.index({ code: 1 });
PaymentProviderSchema.index({ isActive: 1, type: 1 });

// Method to calculate transaction fee
PaymentProviderSchema.methods.calculateFee = function(amount) {
  if (!amount || amount <= 0) {
    return 0;
  }
  
  // Calculate base fee
  const fixedFee = this.fees.fixedFee || 0;
  const percentageFee = this.fees.percentageFee || 0;
  
  let totalFee = fixedFee + (amount * percentageFee / 100);
  
  // Apply minimum fee if set
  if (this.fees.minimumFee && totalFee < this.fees.minimumFee) {
    totalFee = this.fees.minimumFee;
  }
  
  // Apply maximum fee if set
  if (this.fees.maximumFee && totalFee > this.fees.maximumFee) {
    totalFee = this.fees.maximumFee;
  }
  
  return Math.round(totalFee);
};

// Method to validate transaction amount
PaymentProviderSchema.methods.validateTransactionAmount = function(amount) {
  if (!amount || amount <= 0) {
    return {
      valid: false,
      message: 'Invalid amount: Must be greater than 0'
    };
  }
  
  // Check minimum amount
  if (this.limits.minAmount && amount < this.limits.minAmount) {
    return {
      valid: false,
      message: `Amount below minimum: ${this.limits.minAmount} ${this.accountDetails.currency}`
    };
  }
  
  // Check maximum amount
  if (this.limits.maxAmount && amount > this.limits.maxAmount) {
    return {
      valid: false,
      message: `Amount exceeds maximum: ${this.limits.maxAmount} ${this.accountDetails.currency}`
    };
  }
  
  // Check per transaction limit
  if (this.limits.perTransactionLimit && amount > this.limits.perTransactionLimit) {
    return {
      valid: false,
      message: `Amount exceeds per transaction limit: ${this.limits.perTransactionLimit} ${this.accountDetails.currency}`
    };
  }
  
  return {
    valid: true,
    message: 'Valid transaction amount'
  };
};

// Method to log provider status
PaymentProviderSchema.methods.logStatus = function(status, message, duration, affectedServices = []) {
  this.statusLogs.push({
    status,
    message,
    timestamp: new Date(),
    duration,
    affectedServices
  });
  
  // Update current availability
  if (status === 'outage' || status === 'maintenance') {
    this.availability.isAvailable = false;
    this.availability.lastDowntime = new Date();
  } else {
    this.availability.isAvailable = true;
  }
  
  return this.save();
};

// Method to rotate API keys
PaymentProviderSchema.methods.rotateKeys = async function() {
  const crypto = require('crypto');
  
  // Generate new keys
  const newPrimaryKey = crypto.randomBytes(32).toString('hex');
  const newSecondaryKey = crypto.randomBytes(32).toString('hex');
  
  // Store old keys temporarily
  const oldPrimary = this.apiConfig.primaryKey;
  const oldSecondary = this.apiConfig.secondaryKey;
  
  // Update keys
  this.apiConfig.primaryKey = newPrimaryKey;
  this.apiConfig.secondaryKey = newSecondaryKey;
  this.keyRotation.lastRotation = new Date();
  
  // Calculate next rotation date
  const nextRotation = new Date();
  nextRotation.setDate(nextRotation.getDate() + this.keyRotation.rotationFrequencyDays);
  this.keyRotation.nextScheduledRotation = nextRotation;
  
  await this.save();
  
  return {
    oldKeys: {
      primary: oldPrimary,
      secondary: oldSecondary
    },
    newKeys: {
      primary: newPrimaryKey,
      secondary: newSecondaryKey
    },
    nextRotation: nextRotation
  };
};

module.exports = mongoose.model('PaymentProvider', PaymentProviderSchema); 