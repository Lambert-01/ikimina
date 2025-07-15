const express = require("express");
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const paymentController = require('../controllers/paymentController');
const { body } = require('express-validator');

// Validate payment input
const validatePayment = [
  body('paymentMethod')
    .isIn(['cash', 'mobile_money', 'bank_transfer', 'other'])
    .withMessage('Invalid payment method'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom(value => value > 0)
    .withMessage('Amount must be greater than 0')
];

// Validate mobile money payment
const validateMobileMoneyPayment = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom(value => value > 0)
    .withMessage('Amount must be greater than 0'),
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required'),
  body('paymentType')
    .optional()
    .isIn(['contribution', 'loan_repayment', 'membership_fee', 'other'])
    .withMessage('Invalid payment type'),
];

// Public routes (callbacks from payment providers)
router.post('/:provider/callback', paymentController.mobileMoneyCallback);

// Protected routes
router.use(authMiddleware);

// Contribution routes
router.post(
  '/contribution/initiate',
  [
    ...validatePayment,
    body('groupId').isMongoId().withMessage('Invalid group ID')
  ],
  paymentController.initiateContribution
);

// Loan repayment routes
router.post(
  '/loan/repay',
  [
    ...validatePayment,
    body('loanId').isMongoId().withMessage('Invalid loan ID')
  ],
  paymentController.initiateLoanRepayment
);

// Payment status check
router.get('/:transactionId/status', paymentController.checkPaymentStatus);

// Payment history
router.get('/history', paymentController.getPaymentHistory);

// Initiate mobile money payment
router.post(
  '/mobile-money/initiate', 
  validateMobileMoneyPayment,
  paymentController.initiateMobileMoneyPayment
);

// Verify payment status
router.get('/verify/:transactionId', paymentController.verifyPayment);

module.exports = router;
