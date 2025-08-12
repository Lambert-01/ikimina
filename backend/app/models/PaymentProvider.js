const mongoose = require('mongoose');


const PaymentProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Provider name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Provider code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['mobile_money', 'bank', 'card', 'crypto', 'other'],
    required: [true, 'Provider type is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  logo: {
    type: String
  },
  countryCode: {
    type: String,
    default: 'RW',
    uppercase: true
  },
  currency: {
    type: String,
    default: 'RWF',
    uppercase: true
  },
  config: {
    apiUrl: String,
    apiVersion: String,
    authType: {
      type: String,
      enum: ['basic', 'bearer', 'api_key', 'oauth2', 'custom'],
      default: 'bearer'
    },
    credentials: {
      clientId: String,
      clientSecret: String,
      apiKey: String,
      username: String,
      password: String,
      accessToken: String,
      refreshToken: String,
      tokenExpiresAt: Date
    },
    headers: mongoose.Schema.Types.Mixed,
    webhookUrl: String,
    webhookSecret: String,
    callbackUrl: String,
    sandboxMode: {
      type: Boolean,
      default: false
    },
    timeout: {
      type: Number,
      default: 30000 // 30 seconds
    },
    retryAttempts: {
      type: Number,
      default: 3
    },
    retryDelay: {
      type: Number,
      default: 3000 // 3 seconds
    }
  },
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
    maximumFee: Number
  },
  limits: {
    minAmount: {
      type: Number,
      default: 100
    },
    maxAmount: {
      type: Number,
      default: 2000000
    },
    dailyLimit: Number,
    monthlyLimit: Number
  },
  processingTime: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 60
    },
    unit: {
      type: String,
      enum: ['seconds', 'minutes', 'hours', 'days'],
      default: 'seconds'
    }
  },
  supportedOperations: {
    deposit: {
      type: Boolean,
      default: true
    },
    withdrawal: {
      type: Boolean,
      default: true
    },
    transfer: {
      type: Boolean,
      default: true
    }
  },
    status: {
    isOperational: {
      type: Boolean,
      default: true
    },
    lastChecked: Date,
    incidents: [{
      startTime: Date,
      endTime: Date,
      description: String,
      resolved: {
      type: Boolean,
      default: false
    }
    }]
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}, {
  timestamps: true
});

// Calculate fee amount based on transaction amount
PaymentProviderSchema.methods.calculateFee = function(amount) {
  const { fixedFee, percentageFee, minimumFee, maximumFee } = this.fees;
  
  let fee = fixedFee + (amount * (percentageFee / 100));
  
  // Apply minimum fee if set
  if (minimumFee && fee < minimumFee) {
    fee = minimumFee;
  }
  
  // Apply maximum fee if set
  if (maximumFee && fee > maximumFee) {
    fee = maximumFee;
  }
  
  return Math.round(fee);
};

// Check if provider can handle a transaction of given amount
PaymentProviderSchema.methods.canProcessAmount = function(amount) {
  const { minAmount, maxAmount } = this.limits;
  
  return amount >= minAmount && amount <= maxAmount;
};

// Method to record an incident
PaymentProviderSchema.methods.recordIncident = function(description) {
  this.status.isOperational = false;
  
  this.status.incidents.push({
    startTime: new Date(),
    description,
    resolved: false
  });
  
  return this.save();
};

// Method to resolve the latest incident
PaymentProviderSchema.methods.resolveLatestIncident = function() {
  if (this.status.incidents && this.status.incidents.length > 0) {
    const latestIncident = this.status.incidents[this.status.incidents.length - 1];
    
    if (!latestIncident.resolved) {
      latestIncident.resolved = true;
      latestIncident.endTime = new Date();
      this.status.isOperational = true;
    }
  }
  
  return this.save();
};

// Method to update operational status
PaymentProviderSchema.methods.updateOperationalStatus = function(isOperational) {
  this.status.isOperational = isOperational;
  this.status.lastChecked = new Date();
  
  return this.save();
};


module.exports = mongoose.model('PaymentProvider', PaymentProviderSchema);

module.exports = mongoose.model('PaymentProvider', PaymentProviderSchema); 