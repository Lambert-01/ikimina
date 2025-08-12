const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AdminSchema = new mongoose.Schema({
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
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'compliance_officer'],
    default: 'admin'
  },
  permissions: {
    type: [String],
    enum: [
      'manage_users',
      'approve_groups', 
      'suspend_accounts',
      'view_system_logs',
      'manage_platform_settings',
      'generate_reports',
      'handle_disputes',
      'monitor_compliance',
      'manage_admins'
    ],
    default: ['approve_groups', 'view_system_logs', 'generate_reports']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
AdminSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      type: 'admin',
      role: this.role,
      permissions: this.permissions
    },
    process.env.JWT_SECRET || 'secret123456789',
    { expiresIn: process.env.JWT_EXPIRE || '8h' } // Shorter expiry for admin tokens
  );
};

// Match admin entered password to hashed password in database
AdminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if admin has specific permission
AdminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.role === 'super_admin';
};

// Check if admin has any of the specified permissions
AdminSchema.methods.hasAnyPermission = function(permissions) {
  if (this.role === 'super_admin') return true;
  return this.permissions.some(perm => permissions.includes(perm));
};

module.exports = mongoose.model('Admin', AdminSchema);