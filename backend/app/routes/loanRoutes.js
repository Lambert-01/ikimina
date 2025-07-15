const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');

// Controller placeholder - we'll implement real functionality later
const loanController = {
  getAllLoans: (req, res) => {
    const mockLoans = [
      {
        _id: '1',
        amount: 300000,
        status: 'active',
        dueDate: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days from now
        amountDue: 325000,
        groupName: 'Community Savings Group'
      },
      {
        _id: '2',
        amount: 500000,
        status: 'pending',
        dueDate: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
        amountDue: 550000,
        groupName: 'Women Entrepreneurs'
      },
      {
        _id: '3',
        amount: 100000,
        status: 'completed',
        dueDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        amountDue: 0,
        groupName: 'Farmer\'s Cooperative'
      }
    ];
    
    res.json(mockLoans);
  },
  getUserLoans: (req, res) => {
    res.json([]);
  },
  getGroupLoans: (req, res) => {
    res.json([]);
  },
  getLoanById: (req, res) => {
    res.json({});
  },
  requestLoan: (req, res) => {
    res.status(201).json({ message: 'Loan requested successfully' });
  },
  voteOnLoan: (req, res) => {
    res.json({ message: 'Vote recorded' });
  },
  getVotingResults: (req, res) => {
    res.json({ approve: 0, reject: 0, abstain: 0 });
  },
  getRepaymentSchedule: (req, res) => {
    res.json([]);
  },
  calculateLoan: (req, res) => {
    res.json({
      totalAmount: req.body.amount * 1.1,
      monthlyPayment: req.body.amount * 1.1 / req.body.term,
      interestRate: 10
    });
  },
  cancelLoanRequest: (req, res) => {
    res.json({ message: 'Loan request cancelled' });
  }
};

// Routes
router.get('/', authMiddleware, loanController.getAllLoans);
router.get('/user', authMiddleware, loanController.getUserLoans);
router.get('/group/:groupId', authMiddleware, loanController.getGroupLoans);
router.get('/:id', authMiddleware, loanController.getLoanById);
router.post('/request', authMiddleware, loanController.requestLoan);
router.post('/calculate', authMiddleware, loanController.calculateLoan);
router.post('/:id/vote', authMiddleware, loanController.voteOnLoan);
router.get('/:id/votes', authMiddleware, loanController.getVotingResults);
router.get('/:id/schedule', authMiddleware, loanController.getRepaymentSchedule);
router.post('/:id/cancel', authMiddleware, loanController.cancelLoanRequest);

module.exports = router; 