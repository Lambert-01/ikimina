const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email address'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please add a valid email'
    ],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  roles: {
    type: [String],
    enum: ['member', 'manager', 'user'],
    default: ['member']
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  nationalId: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: 'default.jpg'
  },
  groups: [{
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'treasurer', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    }
  }],
  language: {
    type: String,
    enum: ['en', 'fr', 'rw'],
    default: 'en'
  },
  currency: {
    type: String,
    enum: ['RWF', 'USD', 'EUR'],
    default: 'RWF'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    select: false
  },
  verificationExpires: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      roles: this.roles 
    },
    process.env.JWT_SECRET || 'secret123456789',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate verification code
UserSchema.methods.generateVerificationCode = function() {
  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash the code
  const salt = bcrypt.genSaltSync(10);
  this.verificationCode = bcrypt.hashSync(code, salt);
  
  // Set expiration (15 minutes from now)
  this.verificationExpires = Date.now() + 15 * 60 * 1000;
  
  return code;
};

// Check if user is a member of a specific group
UserSchema.methods.isMemberOf = function(groupId) {
  return this.groups.some(g => g.group.toString() === groupId.toString() && g.status === 'active');
};

// Check if user is a manager of a specific group
UserSchema.methods.isManagerOf = function(groupId) {
  return this.groups.some(g => 
    g.group.toString() === groupId.toString() && 
    g.role === 'admin' && 
    g.status === 'active'
  );
};

// Get user's role in a specific group
UserSchema.methods.getRoleInGroup = function(groupId) {
  const groupMembership = this.groups.find(g => g.group.toString() === groupId.toString());
  return groupMembership ? groupMembership.role : null;
};

// Get all groups where user is a manager
UserSchema.methods.getManagedGroups = function() {
  return this.groups
    .filter(g => g.role === 'admin' && g.status === 'active')
    .map(g => g.group);
};

// Get all groups where user is a member (including managed groups)
UserSchema.methods.getMemberGroups = function() {
  return this.groups
    .filter(g => g.status === 'active')
    .map(g => ({
      groupId: g.group,
      role: g.role,
      joinedAt: g.joinedAt
    }));
};

// Check if user has specific role
UserSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

// Check if user has any of the specified roles
UserSchema.methods.hasAnyRole = function(roles) {
  return this.roles.some(role => roles.includes(role));
};

module.exports = mongoose.model('User', UserSchema); 