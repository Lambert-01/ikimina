const Admin = require('../models/Admin');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * @desc    Admin login
 * @route   POST /api/admin/auth/login
 * @access  Public
 */
exports.adminLogin = asyncHandler(async (req, res) => {
  // Sanitize credentials
  const rawEmail = (req.body?.email || '').toString();
  const rawPassword = (req.body?.password || '').toString();
  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword.trim();

  console.log('Admin login attempt for:', email);

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Check for admin in Admin collection
  let admin = await Admin.findOne({ email }).select('+password');
  
  // Fallback: allow users with admin role to login to admin if Admin doc not found
  let isUserAdminFallback = false;
  if (!admin) {
    const userAdmin = await User.findOne({ email }).select('+password');
    if (userAdmin && Array.isArray(userAdmin.roles) && userAdmin.roles.includes('admin')) {
      isUserAdminFallback = true;
      admin = {
        _id: userAdmin._id,
        firstName: userAdmin.firstName,
        lastName: userAdmin.lastName,
        email: userAdmin.email,
        password: userAdmin.password,
        role: 'admin',
        permissions: ['manage_users', 'approve_groups', 'view_system_logs']
      };
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  }

  // Check if admin account is active
  if (admin.status !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Admin account is not active. Please contact super admin.'
    });
  }

  // Check if password matches
  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Update last login time (only if Admin model doc)
  if (!isUserAdminFallback) {
    admin.lastLogin = Date.now();
    await admin.save({ validateBeforeSave: false });
  }

  // Generate token
  const token = isUserAdminFallback
    ? jwt.sign({ id: admin._id, type: 'admin', role: 'admin', permissions: admin.permissions }, process.env.JWT_SECRET || 'secret123456789', { expiresIn: process.env.JWT_EXPIRE || '8h' })
    : admin.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: 'Admin login successful',
    data: {
      token,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role || 'admin',
        permissions: admin.permissions,
        lastLogin: admin.lastLogin
      }
    }
  });
});

/**
 * @desc    Get current logged in admin
 * @route   GET /api/admin/auth/me
 * @access  Private (Admin)
 */
exports.getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id);

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      status: admin.status,
      lastLogin: admin.lastLogin,
      createdAt: admin.createdAt
    }
  });
});

/**
 * @desc    Update admin profile
 * @route   PUT /api/admin/auth/profile
 * @access  Private (Admin)
 */
exports.updateAdminProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;
  
  const updateFields = {};
  if (firstName) updateFields.firstName = firstName;
  if (lastName) updateFields.lastName = lastName;
  
  const admin = await Admin.findByIdAndUpdate(
    req.admin.id,
    updateFields,
    { new: true, runValidators: true }
  );
  
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions
    }
  });
});

/**
 * @desc    Change admin password
 * @route   PUT /api/admin/auth/change-password
 * @access  Private (Admin)
 */
exports.changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current password and new password'
    });
  }
  
  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters long'
    });
  }
  
  // Get admin with password
  const admin = await Admin.findById(req.admin.id).select('+password');
  
  // Check current password
  const isMatch = await admin.matchPassword(currentPassword);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }
  
  // Set new password
  admin.password = newPassword;
  await admin.save();
  
  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

/**
 * @desc    Admin logout
 * @route   POST /api/admin/auth/logout
 * @access  Private (Admin)
 */
exports.adminLogout = asyncHandler(async (req, res) => {
  // In a more sophisticated setup, you would invalidate the token
  // For now, we'll just send a success response
  res.status(200).json({
    success: true,
    message: 'Admin logged out successfully'
  });
});

/**
 * @desc    Create new admin (Super Admin only)
 * @route   POST /api/admin/auth/create-admin
 * @access  Private (Super Admin)
 */
exports.createAdmin = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, permissions } = req.body;

  // Check if requesting admin is super admin
  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only super admins can create new admin accounts'
    });
  }

  // Validate required fields
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res.status(409).json({
      success: false,
      message: 'Admin with this email already exists'
    });
  }

  // Create new admin
  const admin = await Admin.create({
    firstName,
    lastName,
    email,
    password,
    role: role || 'admin',
    permissions: permissions || ['approve_groups', 'view_system_logs', 'generate_reports'],
    createdBy: req.admin.id
  });

  res.status(201).json({
    success: true,
    message: 'Admin created successfully',
    data: {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      status: admin.status
    }
  });
});

/**
 * @desc    Get all admins (Super Admin only)
 * @route   GET /api/admin/auth/admins
 * @access  Private (Super Admin)
 */
exports.getAllAdmins = asyncHandler(async (req, res) => {
  // Check if requesting admin is super admin
  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only super admins can view all admin accounts'
    });
  }

  const admins = await Admin.find()
    .populate('createdBy', 'firstName lastName email')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: admins.length,
    data: admins.map(admin => ({
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      status: admin.status,
      lastLogin: admin.lastLogin,
      createdBy: admin.createdBy,
      createdAt: admin.createdAt
    }))
  });
});

/**
 * @desc    Update admin status (Super Admin only)
 * @route   PUT /api/admin/auth/admins/:id/status
 * @access  Private (Super Admin)
 */
exports.updateAdminStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  // Check if requesting admin is super admin
  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only super admins can update admin status'
    });
  }

  // Validate status
  if (!['active', 'inactive', 'suspended'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be active, inactive, or suspended'
    });
  }

  // Don't allow super admin to deactivate themselves
  if (id === req.admin.id && status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Super admin cannot deactivate their own account'
    });
  }

  const admin = await Admin.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  res.status(200).json({
    success: true,
    message: `Admin status updated to ${status}`,
    data: {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      status: admin.status
    }
  });
});