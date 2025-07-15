const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Simple validation for Rwandan phone numbers
        return /^\+?250\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid Rwandan phone number!`
    }
  },
  email: {
    type: String,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      'Please provide a valid email'
    ],
    unique: true,
    sparse: true, // Allow null/undefined values
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in query results by default
  },
  role: {
    type: String,
    enum: ['member', 'manager', 'admin'],
    default: 'member'
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  // KYC Information
  kycStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'verified', 'rejected'],
    default: 'not_submitted'
  },
  kycLevel: {
    type: String,
    enum: ['none', 'basic', 'full', 'enhanced'],
    default: 'none'
  },
  kycVerified: {
    type: Boolean,
    default: false
  },
  kycSubmissionDate: {
    type: Date
  },
  nationalId: {
    type: String,
    minlength: [16, 'National ID must be 16 characters'],
    maxlength: [16, 'National ID must be 16 characters'],
    unique: true,
    sparse: true
  },
  passport: {
    number: String,
    expiryDate: Date,
    issuingCountry: String
  },
  kycVerifiedAt: Date,
  kycRejectionReason: String,
  kycDocuments: [{
    type: {
      type: String,
      enum: ['national_id_front', 'national_id_back', 'passport', 'selfie', 'other'],
    },
    fileUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  }],
  // Address Information
  location: {
    province: String,
    district: String,
    sector: String,
    cell: String,
    village: String
  },
  // Mobile Money Integration
  mobileMoneyAccounts: [{
    provider: {
      type: String,
      enum: ['MTN', 'Airtel'],
      required: true
    },
    accountNumber: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\+?250\d{9}$/.test(v);
        },
        message: props => `${props.value} is not a valid Rwandan phone number!`
      }
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    isPrimary: {
      type: Boolean,
      default: false
    },
    accountName: String,
    verificationCode: String,
    verificationAttempts: {
      type: Number,
      default: 0
    }
  }],
  // Group Membership
  groups: [{
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending'],
      default: 'pending'
    }
  }],
  // Notification Preferences
  notificationPreferences: {
    sms: {
      enabled: {
        type: Boolean,
        default: true
      },
      types: {
        contribution: { type: Boolean, default: true },
        loan: { type: Boolean, default: true },
        meeting: { type: Boolean, default: true },
        group: { type: Boolean, default: true },
        system: { type: Boolean, default: true }
      }
    },
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      types: {
        contribution: { type: Boolean, default: true },
        loan: { type: Boolean, default: true },
        meeting: { type: Boolean, default: true },
        group: { type: Boolean, default: true },
        system: { type: Boolean, default: true }
      }
    },
    push: {
      enabled: {
        type: Boolean,
        default: true
      },
      types: {
        contribution: { type: Boolean, default: true },
        loan: { type: Boolean, default: true },
        meeting: { type: Boolean, default: true },
        group: { type: Boolean, default: true },
        system: { type: Boolean, default: true }
      }
    },
    inApp: {
      enabled: {
        type: Boolean,
        default: true
      },
      types: {
        contribution: { type: Boolean, default: true },
        loan: { type: Boolean, default: true },
        meeting: { type: Boolean, default: true },
        group: { type: Boolean, default: true },
        system: { type: Boolean, default: true }
      }
    }
  },
  // General User Data
  profileImage: String,
  isActive: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    enum: ['en', 'rw', 'fr'],
    default: 'rw' // Default language is Kinyarwanda
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verificationToken: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  deviceTokens: [String], // For push notifications
  fcmTokens: [String],    // Firebase Cloud Messaging tokens
  
  // Multi-Factor Authentication
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  preferredMfaMethod: {
    type: String,
    enum: ['sms', 'email'],
    default: 'sms'
  },
  mfaToken: String,
  mfaTokenExpiry: Date,
  
  // Security and Compliance
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'flagged', 'pending_review'],
    default: 'active'
  },
  suspensionReason: String,
  suspendedAt: Date,
  suspendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  flaggedReason: String,
  flaggedAt: Date,
  
  // Compliance and Audit
  lastPasswordChange: Date,
  passwordHistory: [{
    password: String,
    changedAt: Date
  }],
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lastFailedLogin: Date,
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    device: String,
    browser: String,
    location: String,
    successful: Boolean
  }],
  
  // Terms and Conditions
  termsAccepted: {
    type: Boolean,
    default: false
  },
  termsAcceptedVersion: String,
  termsAcceptedAt: Date,
  privacyPolicyAccepted: {
    type: Boolean,
    default: false
  },
  privacyPolicyAcceptedVersion: String,
  privacyPolicyAcceptedAt: Date,
  
  // Risk Scoring
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Regulatory Reporting
  reportedToAuthorities: {
    type: Boolean,
    default: false
  },
  reportReason: String,
  reportDate: Date,
  
  // Admin notes
  adminNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  // Store previous password in history if it's being changed
  if (this.isModified('password') && this.password) {
    // Don't store the first password (during registration)
    if (this._id) {
      const salt = await bcrypt.genSalt(10);
      const hashedOldPassword = await bcrypt.hash(this.password, salt);
      
      // Add to password history
      this.passwordHistory = this.passwordHistory || [];
      this.passwordHistory.push({
        password: hashedOldPassword,
        changedAt: new Date()
      });
      
      // Keep only the last 5 passwords
      if (this.passwordHistory.length > 5) {
        this.passwordHistory.shift();
      }
      
      this.lastPasswordChange = new Date();
    }
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with stored hash
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if password was used before
UserSchema.methods.isPasswordReused = async function(newPassword) {
  if (!this.passwordHistory || this.passwordHistory.length === 0) {
    return false;
  }
  
  // Check against password history
  for (const historyItem of this.passwordHistory) {
    const isMatch = await bcrypt.compare(newPassword, historyItem.password);
    if (isMatch) {
      return true;
    }
  }
  
  return false;
};

// Generate and sign JWT token
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role,
      kycVerified: this.kycVerified,
      kycLevel: this.kycLevel
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Generate reset password token
UserSchema.methods.generateResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Generate verification token
UserSchema.methods.generateVerificationToken = function() {
  // Generate 6-digit code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  this.verificationToken = verificationCode;
  return verificationCode;
};

// Generate MFA token
UserSchema.methods.generateMfaToken = function() {
  // Generate 6-digit code
  const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  this.mfaToken = mfaCode;
  this.mfaTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return mfaCode;
};

// Verify MFA token
UserSchema.methods.verifyMfaToken = function(enteredToken) {
  return this.mfaToken === enteredToken && this.mfaTokenExpiry > Date.now();
};

// Generate mobile money verification code
UserSchema.methods.generateMobileMoneyVerificationCode = function(provider) {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  const mobileAccount = this.mobileMoneyAccounts.find(acc => acc.provider === provider);
  if (mobileAccount) {
    mobileAccount.verificationCode = verificationCode;
    mobileAccount.verificationAttempts = 0;
  }
  
  return verificationCode;
};

// Verify mobile money account
UserSchema.methods.verifyMobileMoneyAccount = function(provider, code) {
  const mobileAccount = this.mobileMoneyAccounts.find(acc => acc.provider === provider);
  
  if (!mobileAccount) return false;
  
  if (mobileAccount.verificationCode === code) {
    mobileAccount.isVerified = true;
    mobileAccount.verifiedAt = new Date();
    mobileAccount.verificationCode = undefined;
    return true;
  }
  
  mobileAccount.verificationAttempts += 1;
  return false;
};

// Get primary mobile money account
UserSchema.methods.getPrimaryMobileMoneyAccount = function() {
  return this.mobileMoneyAccounts.find(acc => acc.isPrimary) || this.mobileMoneyAccounts[0];
};

// Set primary mobile money account
UserSchema.methods.setPrimaryMobileMoneyAccount = function(accountId) {
  this.mobileMoneyAccounts.forEach(account => {
    account.isPrimary = account._id.toString() === accountId.toString();
  });
  
  return this.save();
};

// Check if user has completed KYC
UserSchema.methods.hasCompletedKYC = function() {
  return this.kycVerified === true;
};

// Record login attempt
UserSchema.methods.recordLoginAttempt = function(successful, ipAddress, device, browser, location) {
  // Update failed login attempts counter
  if (!successful) {
    this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
    this.lastFailedLogin = new Date();
    
    // Auto-flag account if too many failed attempts
    if (this.failedLoginAttempts >= 5) {
      this.accountStatus = 'flagged';
      this.flaggedReason = 'Multiple failed login attempts';
      this.flaggedAt = new Date();
    }
  } else {
    // Reset failed attempts on successful login
    this.failedLoginAttempts = 0;
    this.lastLogin = new Date();
  }
  
  // Add to login history
  this.loginHistory = this.loginHistory || [];
  this.loginHistory.push({
    timestamp: new Date(),
    ipAddress,
    device,
    browser,
    location,
    successful
  });
  
  // Keep only the last 10 login attempts
  if (this.loginHistory.length > 10) {
    this.loginHistory.shift();
  }
  
  return this.save();
};

// Accept terms and conditions
UserSchema.methods.acceptTerms = function(version) {
  this.termsAccepted = true;
  this.termsAcceptedVersion = version;
  this.termsAcceptedAt = new Date();
  return this.save();
};

// Accept privacy policy
UserSchema.methods.acceptPrivacyPolicy = function(version) {
  this.privacyPolicyAccepted = true;
  this.privacyPolicyAcceptedVersion = version;
  this.privacyPolicyAcceptedAt = new Date();
  return this.save();
};

// Calculate risk score
UserSchema.methods.calculateRiskScore = function() {
  let score = 50; // Default medium risk
  
  // Reduce risk if KYC verified
  if (this.kycVerified) {
    score -= 20;
  }
  
  // Reduce risk if has verified mobile money account
  if (this.mobileMoneyAccounts && this.mobileMoneyAccounts.some(acc => acc.isVerified)) {
    score -= 10;
  }
  
  // Increase risk if recently flagged
  if (this.accountStatus === 'flagged') {
    score += 30;
  }
  
  // Increase risk if failed login attempts
  if (this.failedLoginAttempts > 0) {
    score += Math.min(this.failedLoginAttempts * 5, 20);
  }
  
  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, score));
  
  // Set risk level based on score
  if (score < 30) {
    this.riskLevel = 'low';
  } else if (score < 70) {
    this.riskLevel = 'medium';
  } else {
    this.riskLevel = 'high';
  }
  
  this.riskScore = score;
  return score;
};

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Create indexes for faster queries
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ nationalId: 1 });
UserSchema.index({ 'groups.group': 1 });
UserSchema.index({ kycStatus: 1 });
UserSchema.index({ accountStatus: 1 });
UserSchema.index({ riskLevel: 1 });

module.exports = mongoose.model('User', UserSchema); 