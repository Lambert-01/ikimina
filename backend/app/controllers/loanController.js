const User = require('../models/User');
const Group = require('../models/Group');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

/**
 * Request a loan
 * @route POST /api/loans/request
 * @access Private
 */
exports.requestLoan = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId, amount, purpose, duration } = req.body;
    
    // Validate group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user is a member of the group
    const isMember = group.members.some(member => 
      member.user.toString() === req.user.id && member.status === 'active'
    );
    
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not an active member of this group'
      });
    }
    
    // Check if loans are enabled for this group
    if (!group.loanSettings?.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Loans are not enabled for this group'
      });
    }
    
    // Check if the requested amount is within limits
    const maxLoanAmount = (group.loanSettings.maxLoanPercentage / 100) * group.balance;
    if (amount > maxLoanAmount) {
      return res.status(400).json({
        success: false,
        message: `Loan amount exceeds the maximum allowed (${maxLoanAmount})`
      });
    }
    
    // Check if the duration is within limits
    if (duration > group.loanSettings.maxLoanTerm) {
      return res.status(400).json({
        success: false,
        message: `Loan duration exceeds the maximum allowed (${group.loanSettings.maxLoanTerm} days)`
      });
    }
    
    // Check if user has any active loans in this group
    const existingLoan = await Loan.findOne({
      borrower: req.user.id,
      group: groupId,
      status: { $in: ['pending', 'approved', 'active'] }
    });
    
    if (existingLoan) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active or pending loan in this group'
      });
    }
    
    // Calculate interest and repayment amount
    const interestRate = group.loanSettings.interestRate;
    const interest = (amount * interestRate / 100) * (duration / 30); // Monthly interest rate
    const totalRepayment = amount + interest;
    
    // Create loan request
    const loan = new Loan({
      borrower: req.user.id,
      group: groupId,
      amount,
      interest,
      totalRepayment,
      purpose,
      duration, // in days
      dueDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      status: group.loanSettings.requiresVoting ? 'voting' : 'pending',
      votes: {
        required: group.loanSettings.requiresVoting ? Math.ceil((group.members.length * group.loanSettings.votingThreshold) / 100) : 0,
        approvals: 0,
        rejections: 0,
        voters: []
      }
    });
    
    await loan.save();
    
    // Send notification (would be implemented in a real app)
    
    res.status(201).json({
      success: true,
      data: loan,
      message: group.loanSettings.requiresVoting 
        ? 'Loan request submitted for voting' 
        : 'Loan request submitted for approval'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's loans
 * @route GET /api/loans/my-loans
 * @access Private
 */
exports.getMyLoans = async (req, res, next) => {
  try {
    const { status, groupId } = req.query;
    
    // Build query
    const query = {
      borrower: req.user.id
    };
    
    if (status) {
      query.status = status;
    }
    
    if (groupId) {
      query.group = groupId;
    }
    
    // Get loans
    const loans = await Loan.find(query)
      .sort({ createdAt: -1 })
      .populate('group', 'name');
    
    res.status(200).json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get loans for a group
 * @route GET /api/loans/group/:groupId
 * @access Private
 */
exports.getGroupLoans = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { status } = req.query;
    
    // Check if user is a member or admin of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    const isMember = group.members.some(member => 
      member.user.toString() === req.user.id && member.status === 'active'
    );
    
    const isAdmin = group.admins.includes(req.user.id);
    
    if (!isMember && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view loans for this group'
      });
    }
    
    // Build query
    const query = {
      group: groupId
    };
    
    if (status) {
      query.status = status;
    }
    
    // Get loans
    const loans = await Loan.find(query)
      .sort({ createdAt: -1 })
      .populate('borrower', 'firstName lastName');
    
    res.status(200).json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get loan details
 * @route GET /api/loans/:id
 * @access Private
 */
exports.getLoanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const loan = await Loan.findById(id)
      .populate('borrower', 'firstName lastName')
      .populate('group', 'name');
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }
    
    // Check if user is authorized to view this loan
    const isOwner = loan.borrower._id.toString() === req.user.id;
    const group = await Group.findById(loan.group._id);
    const isGroupAdmin = group.admins.includes(req.user.id);
    
    if (!isOwner && !isGroupAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this loan'
      });
    }
    
    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or reject a loan request (for group admins)
 * @route PUT /api/loans/:id/status
 * @access Private
 */
exports.updateLoanStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, reason } = req.body;
    
    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }
    
    // Check if user is a group admin
    const group = await Group.findById(loan.group);
    if (!group.admins.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this loan status'
      });
    }
    
    // Check if loan is in a state that can be updated
    if (loan.status !== 'pending' && loan.status !== 'voting') {
      return res.status(400).json({
        success: false,
        message: `Cannot update loan status from ${loan.status} to ${status}`
      });
    }
    
    // Update loan status
    loan.status = status;
    if (reason) {
      loan.statusReason = reason;
    }
    
    // If approved, create a disbursement transaction
    if (status === 'approved') {
      // Create transaction record
      const transaction = new Transaction({
        user: loan.borrower,
        group: loan.group,
        type: 'loan_disbursement',
        amount: loan.amount,
        status: 'completed',
        description: `Loan disbursement for ${loan.purpose}`
      });
      
      await transaction.save();
      
      // Update loan with disbursement details
      loan.disbursedAt = Date.now();
      loan.disbursementTransaction = transaction._id;
      
      // Update group balance
      group.balance -= loan.amount;
      await group.save();
    }
    
    await loan.save();
    
    // Send notification (would be implemented in a real app)
    
    res.status(200).json({
      success: true,
      data: loan,
      message: `Loan ${status}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vote on a loan request (for group members)
 * @route POST /api/loans/:id/vote
 * @access Private
 */
exports.voteLoan = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { vote } = req.body;
    
    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }
    
    // Check if loan is in voting state
    if (loan.status !== 'voting') {
      return res.status(400).json({
        success: false,
        message: 'This loan is not currently open for voting'
      });
    }
    
    // Check if user is a member of the group
    const group = await Group.findById(loan.group);
    const isMember = group.members.some(member => 
      member.user.toString() === req.user.id && member.status === 'active'
    );
    
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }
    
    // Check if user has already voted
    const hasVoted = loan.votes.voters.includes(req.user.id);
    if (hasVoted) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this loan request'
      });
    }
    
    // Add vote
    loan.votes.voters.push(req.user.id);
    if (vote === 'approve') {
      loan.votes.approvals += 1;
    } else {
      loan.votes.rejections += 1;
    }
    
    // Check if voting threshold is reached
    const totalVotes = loan.votes.approvals + loan.votes.rejections;
    if (totalVotes >= loan.votes.required) {
      // Determine outcome
      if (loan.votes.approvals > loan.votes.rejections) {
        loan.status = 'pending'; // Move to admin approval
      } else {
        loan.status = 'rejected';
        loan.statusReason = 'Rejected by group vote';
      }
    }
    
    await loan.save();
    
    res.status(200).json({
      success: true,
      data: loan,
      message: `Vote recorded: ${vote}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Make a loan repayment
 * @route POST /api/loans/:id/repay
 * @access Private
 */
exports.repayLoan = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { amount, paymentMethod, reference } = req.body;
    
    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }
    
    // Check if user is the borrower
    if (loan.borrower.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to repay this loan'
      });
    }
    
    // Check if loan is active
    if (loan.status !== 'approved' && loan.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This loan is not active and cannot be repaid'
      });
    }
    
    // Calculate remaining amount
    const remainingAmount = loan.totalRepayment - loan.repaidAmount;
    
    // Check if payment amount is valid
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than zero'
      });
    }
    
    if (amount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount exceeds the remaining balance (${remainingAmount})`
      });
    }
    
    // Create transaction record
    const transaction = new Transaction({
      user: req.user.id,
      group: loan.group,
      type: 'loan_repayment',
      amount,
      paymentMethod,
      reference,
      status: 'completed',
      description: `Loan repayment for ${loan.purpose}`
    });
    
    await transaction.save();
    
    // Update loan with repayment details
    loan.repaidAmount += amount;
    loan.repayments.push({
      amount,
      date: Date.now(),
      transaction: transaction._id
    });
    
    // Check if loan is fully repaid
    if (loan.repaidAmount >= loan.totalRepayment) {
      loan.status = 'repaid';
      loan.repaidAt = Date.now();
    } else {
      loan.status = 'active';
    }
    
    await loan.save();
    
    // Update group balance
    const group = await Group.findById(loan.group);
    group.balance += amount;
    await group.save();
    
    res.status(200).json({
      success: true,
      data: {
        loan,
        transaction
      },
      message: loan.status === 'repaid' 
        ? 'Loan fully repaid' 
        : 'Loan repayment successful'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports; 