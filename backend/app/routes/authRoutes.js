const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  [
    // Validation rules
    body('firstName')
      .notEmpty()
      .withMessage('First name is required')
      .trim(),
    
    body('lastName')
      .notEmpty()
      .withMessage('Last name is required')
      .trim(),
    
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+?250\d{9}$/)
      .withMessage('Please enter a valid Rwandan phone number'),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    
    body('language')
      .optional()
      .isIn(['en', 'rw', 'fr'])
      .withMessage('Language must be one of: en, rw, fr')
  ],
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc Login user and get token
 * @access Public
 */
router.post(
  '/login',
  [
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  authController.login
);

/**
 * @route GET /api/auth/me
 * @desc Get current user info
 * @access Private
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * @route POST /api/auth/verify
 * @desc Verify user phone number
 * @access Public
 */
router.post(
  '/verify',
  [
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required'),
    
    body('verificationToken')
      .notEmpty()
      .withMessage('Verification token is required')
  ],
  authController.verifyUser
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset token
 * @access Public
 */
router.post(
  '/forgot-password',
  [
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
  ],
  authController.forgotPassword
);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post(
  '/reset-password',
  [
    body('resetToken')
      .notEmpty()
      .withMessage('Reset token is required'),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  authController.resetPassword
);

module.exports = router; 