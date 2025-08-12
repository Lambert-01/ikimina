const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const loanController = require('../controllers/loanController');
const { check } = require('express-validator');

// Validation middleware
const loanRequestValidation = [
  check('groupId', 'Group ID is required').not().isEmpty(),
  check('amount', 'Amount is required and must be a number').isNumeric(),
  check('purpose', 'Purpose is required').not().isEmpty(),
  check('duration', 'Duration is required and must be a number').isNumeric()
];

const loanStatusValidation = [
  check('status', 'Status is required').isIn(['approved', 'rejected'])
];

const loanVoteValidation = [
  check('vote', 'Vote is required').isIn(['approve', 'reject'])
];

const loanRepaymentValidation = [
  check('amount', 'Amount is required and must be a number').isNumeric(),
  check('paymentMethod', 'Payment method is required').not().isEmpty()
];

// Apply auth middleware to all routes
router.use(protect);

// Loan request routes
router.post('/request', loanRequestValidation, loanController.requestLoan);
router.get('/my-loans', loanController.getMyLoans);
router.get('/group/:groupId', loanController.getGroupLoans);
router.get('/:id', loanController.getLoanById);
router.put('/:id/status', loanStatusValidation, loanController.updateLoanStatus);
router.post('/:id/vote', loanVoteValidation, loanController.voteLoan);
router.post('/:id/repay', loanRepaymentValidation, loanController.repayLoan);

module.exports = router; 