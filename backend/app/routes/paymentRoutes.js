const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const paymentController = require('../controllers/paymentController');
const { check } = require('express-validator');

// Validation middleware
const contributionValidation = [
  check('groupId', 'Group ID is required').not().isEmpty(),
  check('amount', 'Amount is required and must be a number').isNumeric(),
  check('paymentMethod', 'Payment method is required').not().isEmpty()
];

const paymentMethodValidation = [
  check('provider', 'Provider is required').not().isEmpty(),
  check('accountNumber', 'Account number is required').not().isEmpty(),
  check('accountName', 'Account name is required').not().isEmpty()
];

// Apply auth middleware to all routes
router.use(protect);

// Contribution routes
router.post('/contribution', contributionValidation, paymentController.makeContribution);
router.get('/contributions', paymentController.getContributionHistory);
router.get('/contributions/summary', paymentController.getContributionSummary);
router.get('/contributions/overdue', paymentController.getOverdueContributions);

// Payment methods routes
router.get('/methods', paymentController.getPaymentMethods);
router.post('/methods', paymentMethodValidation, paymentController.addPaymentMethod);
router.delete('/methods/:id', paymentController.removePaymentMethod);

module.exports = router;
