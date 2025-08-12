const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * @desc    Register a new user
 * @route   POST /auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, email, password, language } = req.body;
    
    console.log('Registration attempt:', { firstName, lastName, phoneNumber, email });

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (firstName, lastName, phoneNumber, email, password)'
      });
    }

    // Validate phone number format
    if (!phoneNumber.startsWith('+250')) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must start with +250'
      });
    }

    // Check if user already exists with this phone number
    let user = await User.findOne({ phoneNumber });
    
    if (user) {
      return res.status(409).json({
        success: false,
        message: 'User phone number already exists'
      });
    }

    // Check if user already exists with this email
    user = await User.findOne({ email });
    
    if (user) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    user = new User({
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      language: language || 'en',
      isVerified: true // For simplicity in development, set to true
    });

    await user.save();
    console.log('User created successfully:', user._id);

    // Generate token
    const token = user.getSignedJwtToken();

    // Return token and user data (consistent with login response)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          email: user.email,
          roles: user.roles,
          primaryRole: 'member',
          memberOfGroups: [],
          managerOfGroups: []
        },
        // Also provide flattened structure for backward compatibility
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        roles: user.roles,
        primaryRole: 'member',
        memberOfGroups: [],
        managerOfGroups: []
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      let message = 'Duplicate entry detected';
      
      if (field === 'phoneNumber') {
        message = 'User phone number already exists';
      } else if (field === 'email') {
        message = 'User with this email already exists';
      }
      
      return res.status(409).json({
        success: false,
        message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    console.log('Login attempt for:', phoneNumber);

    // Validate phone number and password
    if (!phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number and password'
      });
    }

    // Check for user
    const user = await User.findOne({ phoneNumber }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = user.getSignedJwtToken();

    // Determine primary role for UI routing
    const primaryRole = user.roles.includes('admin') ? 'admin' : 
                       user.roles.includes('manager') ? 'manager' : 'member';

    // Get user groups (skip population for now to avoid Group model dependency)
    // await user.populate('memberOfGroups', 'name description status');
    // await user.populate('managerOfGroups', 'name description status');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          email: user.email,
          roles: user.roles,
          primaryRole: primaryRole,
          memberOfGroups: [],
          managerOfGroups: []
        },
        // Also provide flattened structure for backward compatibility
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        roles: user.roles,
        primaryRole: primaryRole,
        memberOfGroups: [],
        managerOfGroups: []
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Login error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Send verification code to phone number
 * @route   POST /auth/send-verification
 * @access  Public
 */
exports.sendVerificationCode = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a phone number'
      });
    }
    
    // Check if phone number exists
    let user = await User.findOne({ phoneNumber });
    
    // For development, create a new unverified user if none exists
    if (!user) {
      user = new User({
        firstName: 'Temporary',
        lastName: 'User',
        phoneNumber,
        password: 'temporary123', // Will be replaced during registration
        isVerified: false
      });
      
      await user.save();
    }
    
    // Generate verification code
    const verificationCode = user.generateVerificationCode();
    await user.save();
    
    // In a real app, we would send this code via SMS
    // For development, log it to the console
    console.log(`Verification code for ${phoneNumber}: ${verificationCode}`);
    
    res.status(200).json({
      success: true,
      message: 'Verification code sent to your phone number'
    });
  } catch (error) {
    console.error('Send verification code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code'
    });
  }
};

/**
 * @desc    Verify OTP code
 * @route   POST /auth/verify-otp
 * @access  Public
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otpCode } = req.body;
    
    if (!phoneNumber || !otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number and verification code'
      });
    }
    
    // Find user by phone number
    const user = await User.findOne({ phoneNumber }).select('+verificationCode +verificationExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this phone number'
      });
    }
    
    // Check if verification code exists and is not expired
    if (!user.verificationCode || !user.verificationExpires) {
      return res.status(400).json({
        success: false,
        message: 'No verification code requested or code expired'
      });
    }
    
    // Check if code is expired
    if (user.verificationExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired'
      });
    }
    
    // For development, accept any code
    if (process.env.NODE_ENV === 'development') {
      // Mark user as verified
      user.isVerified = true;
      user.verificationCode = undefined;
      user.verificationExpires = undefined;
      
      await user.save();
      
      return res.status(200).json({
        success: true,
        message: 'Phone number verified successfully'
      });
    }
    
    // Check if code matches
    const isMatch = await bcrypt.compare(otpCode, user.verificationCode);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }
    
    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify code'
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    // Get user data (skip group population for now to avoid Group model dependency)
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        memberOfGroups: [],
        managerOfGroups: [],
        language: user.language,
        currency: user.currency,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, language, currency } = req.body;
    
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (language) updateFields.language = language;
    if (currency) updateFields.currency = currency;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        language: user.language,
        currency: user.currency
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * @desc    Change password
 * @route   PUT /auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Set new password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
}; 

/**
 * @desc    Get user roles
 * @route   GET /auth/roles
 * @access  Private
 */
exports.getUserRoles = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        roles: user.roles || ['member'],
        memberOfGroups: user.memberOfGroups || [],
        managerOfGroups: user.managerOfGroups || []
      }
    });
  } catch (error) {
    console.error('Get user roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user roles'
    });
  }
};

/**
 * @desc    Request role upgrade
 * @route   POST /auth/roles/request
 * @access  Private
 */
exports.requestRoleUpgrade = async (req, res) => {
  try {
    const { requestedRole } = req.body;
    
    if (!requestedRole) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the requested role'
      });
    }
    
    // Validate role
    if (!['member', 'manager'].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role requested'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user already has the role
    if (user.roles.includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: `You already have the ${requestedRole} role`
      });
    }
    
    // In production, this would create a request for admin approval
    // For now, we'll simulate the process
    
    // For development mode, auto-approve
    if (process.env.NODE_ENV === 'development') {
      // Add the role if not already present
      if (!user.roles.includes(requestedRole)) {
        user.roles.push(requestedRole);
        await user.save();
      }
      
      return res.status(200).json({
        success: true,
        message: `Role ${requestedRole} granted automatically in development mode`,
        data: {
          roles: user.roles
        }
      });
    }
    
    // For production, create a notification for admins
    // This would be handled by a notification service in a real app
    
    res.status(200).json({
      success: true,
      message: `Your request for ${requestedRole} role has been submitted for approval`
    });
  } catch (error) {
    console.error('Request role upgrade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process role upgrade request'
    });
  }
}; 