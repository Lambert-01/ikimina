const User = require('../models/User');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

/**
 * Register a new user with enhanced KYC options
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { 
      firstName, 
      lastName, 
      phoneNumber, 
      email, 
      password, 
      language,
      dateOfBirth,
      nationalId,
      district,
      sector,
      cell,
      village
    } = req.body;

    // Check if user with this phone number already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this phone number already exists'
      });
    }

    // Check if email is provided and already exists
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email already exists'
        });
      }
    }

    // Check if National ID is provided and already exists
    if (nationalId) {
      const nidExists = await User.findOne({ nationalId });
      if (nidExists) {
        return res.status(409).json({
          success: false,
          message: 'A user with this National ID already exists'
        });
      }
    }

    // Generate verification token
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create new user with enhanced fields
    const user = await User.create({
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      language: language || 'rw',
      verificationToken: verificationCode,
      // Auto-verify users in development mode
      isVerified: process.env.NODE_ENV === 'development',
      // Enhanced KYC fields
      dateOfBirth,
      nationalId,
      location: {
        district,
        sector,
        cell,
        village
      },
      kycVerified: nationalId ? process.env.NODE_ENV === 'development' : false,
      kycLevel: nationalId ? 'basic' : 'none',
      registrationDate: Date.now()
    });

    // Remove password from response
    user.password = undefined;
    user.verificationToken = undefined;

    // Send verification code (in real-world this would be sent via SMS)
    // This is just for development purposes
    logger.info(`Verification code for ${phoneNumber}: ${verificationCode}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your phone number.',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        language: user.language,
        isVerified: user.isVerified,
        kycVerified: user.kycVerified,
        kycLevel: user.kycLevel
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

/**
 * Initiate login process - may trigger MFA or NID verification
 * @route POST /api/auth/initiate-login
 * @access Public
 */
exports.initiateLogin = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { phoneNumber, email, password } = req.body;

    // Find user by phone number or email
    let user;
    if (phoneNumber) {
      user = await User.findOne({ phoneNumber }).select('+password');
    } else if (email) {
      user = await User.findOne({ email }).select('+password');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number'
      });
    }

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is verified (skip this check in development mode)
    if (!user.isVerified && process.env.NODE_ENV !== 'development') {
      return res.status(401).json({
        success: false,
        message: 'Please verify your phone number before logging in'
      });
    }

    // Auto-verify users in development mode if not already verified
    if (!user.isVerified && process.env.NODE_ENV === 'development') {
      user.isVerified = true;
      logger.info(`Auto-verifying user ${phoneNumber || email} in development mode`);
    }

    // In development mode, skip all verification
    if (process.env.NODE_ENV === 'development') {
      return exports.login(req, res, next);
    }

    // Check if MFA is required
    if (user.mfaEnabled) {
      // Generate and send OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.mfaToken = otpCode;
      user.mfaTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      // Log OTP for development purposes
      logger.info(`MFA code for ${phoneNumber || email}: ${otpCode}`);

      // In production, send OTP via SMS or email based on user preference
      if (user.preferredMfaMethod === 'sms' && user.phoneNumber) {
        // sendSms(user.phoneNumber, `Your verification code is: ${otpCode}`);
        logger.info(`SMS OTP would be sent to ${user.phoneNumber}`);
      } else if (user.email) {
        // sendEmail(user.email, 'Your verification code', `Your verification code is: ${otpCode}`);
        logger.info(`Email OTP would be sent to ${user.email}`);
      }

      return res.status(200).json({
        success: true,
        requiresMfa: true,
        mfaMethod: user.preferredMfaMethod || 'sms'
      });
    }

    // Check if NID verification is required for high-risk operations
    // This is a simplified example - in a real system, you'd have more complex rules
    if (user.lastLogin && Date.now() - new Date(user.lastLogin).getTime() > 30 * 24 * 60 * 60 * 1000) {
      // If it's been more than 30 days since last login, require NID verification
      return res.status(200).json({
        success: true,
        requiresNidVerification: true
      });
    }

    // If no additional verification needed, proceed with regular login
    return exports.login(req, res, next);
  } catch (error) {
    logger.error('Login initiation error:', error);
    next(error);
  }
};

/**
 * Verify MFA code during login
 * @route POST /api/auth/verify-mfa
 * @access Public
 */
exports.verifyMfa = async (req, res, next) => {
  try {
    const { phoneNumber, email, otpCode } = req.body;

    // Find user by phone number or email
    let user;
    if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
    } else if (email) {
      user = await User.findOne({ email });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number'
      });
    }

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if MFA token matches and is not expired
    if (!user.mfaToken || user.mfaToken !== otpCode || !user.mfaTokenExpiry || user.mfaTokenExpiry < Date.now()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Clear MFA token and expiry
    user.mfaToken = undefined;
    user.mfaTokenExpiry = undefined;
    user.lastLogin = Date.now();
    await user.save();

    // Create token
    const token = user.generateAuthToken();

    // Get groups the user belongs to
    const groups = await require('../models/Group').find({
      'members.userId': user._id
    }).select('_id name');

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        language: user.language,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        kycVerified: user.kycVerified,
        kycLevel: user.kycLevel,
        mfaEnabled: user.mfaEnabled,
        groups: groups.map(group => ({ id: group._id, name: group.name })),
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    logger.error('MFA verification error:', error);
    next(error);
  }
};

/**
 * Verify National ID during login
 * @route POST /api/auth/verify-nid
 * @access Public
 */
exports.verifyNid = async (req, res, next) => {
  try {
    const { phoneNumber, email, nidNumber } = req.body;

    // Find user by phone number or email
    let user;
    if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
    } else if (email) {
      user = await User.findOne({ email });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number'
      });
    }

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if National ID matches
    if (!user.nationalId || user.nationalId !== nidNumber) {
      return res.status(401).json({
        success: false,
        message: 'Invalid National ID number'
      });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    // Create token
    const token = user.generateAuthToken();

    // Get groups the user belongs to
    const groups = await require('../models/Group').find({
      'members.userId': user._id
    }).select('_id name');

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        language: user.language,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        kycVerified: user.kycVerified,
        kycLevel: user.kycLevel,
        mfaEnabled: user.mfaEnabled,
        groups: groups.map(group => ({ id: group._id, name: group.name })),
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    logger.error('NID verification error:', error);
    next(error);
  }
};

/**
 * Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { phoneNumber, email, password } = req.body;

    // Find user by phone number or email
    let user;
    if (phoneNumber) {
      user = await User.findOne({ phoneNumber }).select('+password');
    } else if (email) {
      user = await User.findOne({ email }).select('+password');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number'
      });
    }

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is verified (skip this check in development mode)
    if (!user.isVerified && process.env.NODE_ENV !== 'development') {
      return res.status(401).json({
        success: false,
        message: 'Please verify your phone number before logging in'
      });
    }
    
    // Auto-verify users in development mode if not already verified
    if (!user.isVerified && process.env.NODE_ENV === 'development') {
      user.isVerified = true;
      logger.info(`Auto-verifying user ${phoneNumber || email} in development mode`);
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    // Create token
    const token = user.generateAuthToken();

    // Remove sensitive fields
    user.password = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.verificationToken = undefined;
    user.mfaToken = undefined;
    user.mfaTokenExpiry = undefined;

    // Get groups the user belongs to
    const groups = await require('../models/Group').find({
      'members.userId': user._id
    }).select('_id name');

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        language: user.language,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        kycVerified: user.kycVerified,
        kycLevel: user.kycLevel,
        mfaEnabled: user.mfaEnabled,
        groups: groups.map(group => ({ id: group._id, name: group.name })),
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * Verify user's phone number
 * @route POST /api/auth/verify
 * @access Public
 */
exports.verifyUser = async (req, res, next) => {
  try {
    const { phoneNumber, verificationToken } = req.body;

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if verification token matches
    if (user.verificationToken !== verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Mark user as verified and clear verification token
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully'
    });
  } catch (error) {
    logger.error('Verification error:', error);
    next(error);
  }
};

/**
 * Request password reset token
 * @route POST /api/auth/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { phoneNumber, email } = req.body;

    // Find user by phone number or email
    let user;
    if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
    } else if (email) {
      user = await User.findOne({ email });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number'
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this contact information'
      });
    }

    // Generate reset token
    const resetToken = user.generateResetPasswordToken();
    await user.save();

    // In a real application, send SMS or email with reset token
    // For now, just log it
    logger.info(`Reset token for ${phoneNumber || email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'Password reset token sent'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

/**
 * Reset password
 * @route POST /api/auth/reset-password
 * @access Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { resetToken, password } = req.body;

    // Hash the token from params
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find user by hashed token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    next(error);
  }
};

/**
 * Get current user info
 * @route GET /api/auth/me
 * @access Private
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    // User is already attached to req by auth middleware
    const user = await User.findById(req.user.id).select('-password -verificationToken -resetPasswordToken -resetPasswordExpire -mfaToken -mfaTokenExpiry');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get groups the user belongs to
    const groups = await require('../models/Group').find({
      'members.userId': user._id
    }).select('_id name');

    // Add groups to user object
    const userWithGroups = user.toObject();
    userWithGroups.groups = groups.map(group => ({ id: group._id, name: group.name }));

    res.status(200).json({
      success: true,
      user: userWithGroups
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    next(error);
  }
};

/**
 * Enable MFA for a user
 * @route POST /api/auth/enable-mfa
 * @access Private
 */
exports.enableMfa = async (req, res, next) => {
  try {
    const { method } = req.body;
    
    // Validate method
    if (method !== 'sms' && method !== 'email') {
      return res.status(400).json({
        success: false,
        message: 'Invalid MFA method. Must be either "sms" or "email"'
      });
    }

    // If email method is chosen, ensure user has an email
    if (method === 'email' && !req.user.email) {
      return res.status(400).json({
        success: false,
        message: 'You must add an email address to your account to use email MFA'
      });
    }

    // Update user
    const user = await User.findById(req.user.id);
    user.mfaEnabled = true;
    user.preferredMfaMethod = method;
    await user.save();

    res.status(200).json({
      success: true,
      message: `MFA enabled successfully using ${method}`
    });
  } catch (error) {
    logger.error('Enable MFA error:', error);
    next(error);
  }
};

/**
 * Disable MFA for a user
 * @route POST /api/auth/disable-mfa
 * @access Private
 */
exports.disableMfa = async (req, res, next) => {
  try {
    const { verificationCode } = req.body;
    
    // For security, require verification before disabling MFA
    const user = await User.findById(req.user.id);
    
    // In a real app, you would verify the code
    // For this example, we'll just check if it's provided
    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required'
      });
    }

    // Update user
    user.mfaEnabled = false;
    user.preferredMfaMethod = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'MFA disabled successfully'
    });
  } catch (error) {
    logger.error('Disable MFA error:', error);
    next(error);
  }
};

/**
 * Submit KYC information
 * @route POST /api/auth/kyc-verification
 * @access Private
 */
exports.submitKyc = async (req, res, next) => {
  try {
    const { nidNumber, dateOfBirth, fullName } = req.body;
    
    // In a real app, you would verify this information with an external service
    // For this example, we'll just update the user's KYC status
    
    const user = await User.findById(req.user.id);
    user.nationalId = nidNumber;
    user.dateOfBirth = dateOfBirth;
    user.kycVerified = true;
    user.kycLevel = 'full';
    user.kycSubmissionDate = Date.now();
    
    // Handle document upload if included
    if (req.file) {
      user.kycDocuments = [{
        type: 'national_id',
        fileUrl: req.file.path,
        uploadDate: Date.now(),
        verified: process.env.NODE_ENV === 'development' // Auto-verify in dev mode
      }];
    }
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'KYC information submitted successfully',
      data: {
        kycVerified: user.kycVerified,
        kycLevel: user.kycLevel
      }
    });
  } catch (error) {
    logger.error('KYC submission error:', error);
    next(error);
  }
};

/**
 * Get KYC status
 * @route GET /api/auth/kyc-status
 * @access Private
 */
exports.getKycStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('kycVerified kycLevel kycSubmissionDate nationalId');
    
    res.status(200).json({
      success: true,
      data: {
        kycVerified: user.kycVerified,
        kycLevel: user.kycLevel,
        kycSubmissionDate: user.kycSubmissionDate,
        hasNationalId: !!user.nationalId
      }
    });
  } catch (error) {
    logger.error('Get KYC status error:', error);
    next(error);
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, language, email, phoneNumber } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    
    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (language) user.language = language;
    
    // Check if email is being updated and is not already in use
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email is already in use'
        });
      }
      user.email = email;
    }
    
    // Check if phone is being updated and is not already in use
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const phoneExists = await User.findOne({ phoneNumber, _id: { $ne: user._id } });
      if (phoneExists) {
        return res.status(409).json({
          success: false,
          message: 'Phone number is already in use'
        });
      }
      user.phoneNumber = phoneNumber;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        language: user.language
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

/**
 * Change password
 * @route POST /api/auth/change-password
 * @access Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};

/**
 * Validate token
 * @route GET /api/auth/validate-token
 * @access Private
 */
exports.validateToken = async (req, res, next) => {
  try {
    // If middleware passed, token is valid
    res.status(200).json({
      success: true,
      valid: true
    });
  } catch (error) {
    logger.error('Token validation error:', error);
    next(error);
  }
};

/**
 * Logout (invalidate token)
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logout = async (req, res, next) => {
  try {
    // In a real app with a token blacklist, you would add the token to the blacklist here
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
}; 