const Loan = require('../models/Loan');
const User = require('../models/User');
const Group = require('../models/Group');
const mongoose = require('mongoose');

/**
 * @desc    Get all loans with pagination and filtering
 * @route   GET /admin/loans
 * @access  Private (Admin)
 */
exports.getLoans = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Build filter query
    const filterQuery = {};
    
    // Filter by status if provided
    if (req.query.status) {
      filterQuery.status = req.query.status;
    }
    
    // Filter by group if provided
    if (req.query.groupId && mongoose.Types.ObjectId.isValid(req.query.groupId)) {
      filterQuery.group = req.query.groupId;
    }
    
    // Filter by user if provided
    if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
      filterQuery.user = req.query.userId;
    }
    
    // Filter by amount range
    if (req.query.minAmount) {
      filterQuery.amount = { $gte: parseInt(req.query.minAmount) };
    }
    
    if (req.query.maxAmount) {
      if (filterQuery.amount) {
        filterQuery.amount.$lte = parseInt(req.query.maxAmount);
      } else {
        filterQuery.amount = { $lte: parseInt(req.query.maxAmount) };
      }
    }
    
    // Filter by date range
    if (req.query.startDate) {
      filterQuery.createdAt = { $gte: new Date(req.query.startDate) };
    }
    
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
      
      if (filterQuery.createdAt) {
        filterQuery.createdAt.$lte = endDate;
      } else {
        filterQuery.createdAt = { $lte: endDate };
      }
    }
    
    // Count total documents
    const total = await Loan.countDocuments(filterQuery);
    
    // Get loans with pagination
    const loans = await Loan.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('group', 'name status')
      .populate('approvedBy', 'firstName lastName');
    
    // Pagination result
    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    };
    
    res.status(200).json({
      success: true,
      count: loans.length,
      pagination,
      data: loans
    });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get loan by ID
 * @route   GET /admin/loans/:id
 * @access  Private (Admin)
 */
exports.getLoanById = async (req, res) => {
  try {
    const loanId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(loanId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid loan ID format'
      });
    }
    
    const loan = await Loan.findById(loanId)
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('group', 'name status contributionSettings')
      .populate('approvedBy', 'firstName lastName');
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    console.error('Get loan by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Update loan status
 * @route   PUT /admin/loans/:id/status
 * @access  Private (Admin)
 */
exports.updateLoanStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const loanId = req.params.id;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }
    
    if (!['pending', 'approved', 'rejected', 'disbursed', 'paid', 'defaulted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(loanId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid loan ID format'
      });
    }
    
    const loan = await Loan.findById(loanId);
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }
    
    // Handle status-specific logic
    if (status === 'approved' && loan.status !== 'approved') {
      // When approving a loan
      loan.approvedBy = req.admin.id;
      loan.approvedAt = Date.now();
      
      // Update group's financial summary
      const group = await Group.findById(loan.group);
      if (group) {
        group.financialSummary.totalLoans += loan.amount;
        group.financialSummary.outstandingLoans += loan.amount;
        group.financialSummary.availableFunds -= loan.amount;
        await group.save();
      }
    } else if (status === 'rejected' && loan.status !== 'rejected') {
      // When rejecting a loan
      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a reason for rejection'
        });
      }
      loan.rejectionReason = reason;
    }
    
    loan.status = status;
    await loan.save();
    
    res.status(200).json({
      success: true,
      message: `Loan status updated to ${status}`,
      data: {
        id: loan._id,
        amount: loan.amount,
        status: loan.status
      }
    });
  } catch (error) {
    console.error('Update loan status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Delete loan
 * @route   DELETE /admin/loans/:id
 * @access  Private (Admin)
 */
exports.deleteLoan = async (req, res) => {
  try {
    const loanId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(loanId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid loan ID format'
      });
    }
    
    const loan = await Loan.findById(loanId);
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }
    
    // Only allow deleting loans that are pending or rejected
    if (!['pending', 'rejected'].includes(loan.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only pending or rejected loans can be deleted'
      });
    }
    
    await Loan.findByIdAndDelete(loanId);
    
    res.status(200).json({
      success: true,
      message: 'Loan deleted successfully'
    });
  } catch (error) {
    console.error('Delete loan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 