const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Group = require('../models/Group');
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');
const paymentGateways = require('../../config/paymentGateways');
const logger = require('../utils/logger');
const { createNotification } = require('../utils/helpers');
const crypto = require('crypto');
const axios = require('axios');
const { validationResult } = require('express-validator');

/**
 * Initialize a mobile money payment for contribution
 * @route POST /api/payments/contribution/initiate
 * @access Private (Member)
 */
exports.initiateContribution = async (req, res, next) => {
  try {
    const { groupId, amount, paymentMethod, mobileNumber } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!groupId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Group ID, amount, and payment method are required'
      });
    }

    // Check if user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const isMember = group.members.some(member => 
      member.user.toString() === userId && member.status === 'active'
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not an active member of this group'
      });
    }

    // Generate a unique reference for this transaction
    const paymentReference = `IKIM-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    // Create a pending transaction record
    const transaction = await Transaction.create({
      type: 'contribution',
      amount,
      user: userId,
      group: groupId,
      paymentMethod,
      paymentReference,
      paymentStatus: 'pending',
      mobileNumber: mobileNumber || req.user.phoneNumber,
      description: `Contribution to ${group.name}`,
      isManualEntry: false,
      currency: 'RWF'
    });

    // Initiate payment with the selected mobile money provider
    let paymentResponse;
    
    if (paymentMethod === 'mobile_money') {
      // Determine provider from phone number (simple logic - can be enhanced)
      const provider = mobileNumber.startsWith('25078') ? 'mtn' : 'airtel';
      
      paymentResponse = await initiateProviderPayment(provider, {
        amount,
        phoneNumber: mobileNumber || req.user.phoneNumber,
        reference: paymentReference,
        description: `Contribution to ${group.name}`
      });
      
      // Update transaction with provider response data
      transaction.metadata = {
        mobileMoneyOperator: provider,
        transactionId: paymentResponse.transactionId,
        gatewayResponse: paymentResponse.data
      };
      
      await transaction.save();
    } else {
      paymentResponse = {
        success: true,
        message: 'Manual payment initiated',
        data: { reference: paymentReference }
      };
    }

    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        transactionId: transaction._id,
        paymentReference,
        provider: transaction.metadata?.mobileMoneyOperator || 'manual',
        nextStep: paymentResponse.nextStep || 'Check your phone for payment prompt'
      }
    });
  } catch (error) {
    logger.error('Error initiating contribution payment:', error);
    next(error);
  }
};

/**
 * Initialize a mobile money payment for loan repayment
 * @route POST /api/payments/loan/repay
 * @access Private (Member)
 */
exports.initiateLoanRepayment = async (req, res, next) => {
  try {
    const { loanId, amount, paymentMethod, mobileNumber } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!loanId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Loan ID, amount, and payment method are required'
      });
    }

    // Check if loan exists and belongs to the user
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'This loan does not belong to you'
      });
    }

    if (loan.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot make payment on a loan with status: ${loan.status}`
      });
    }

    if (amount > loan.remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `The payment amount (${amount}) exceeds the remaining loan balance (${loan.remainingAmount})`
      });
    }

    // Generate a unique reference for this transaction
    const paymentReference = `IKIM-LOAN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    // Create a pending transaction record
    const transaction = await Transaction.create({
      type: 'loan_repayment',
      amount,
      user: userId,
      group: loan.group,
      loan: loanId,
      paymentMethod,
      paymentReference,
      paymentStatus: 'pending',
      mobileNumber: mobileNumber || req.user.phoneNumber,
      description: `Loan repayment for ${loan._id}`,
      isManualEntry: false,
      currency: 'RWF',
      previousBalance: loan.remainingAmount,
      newBalance: loan.remainingAmount - amount
    });

    // Initiate payment with the selected mobile money provider
    let paymentResponse;
    
    if (paymentMethod === 'mobile_money') {
      // Determine provider from phone number (simple logic - can be enhanced)
      const provider = mobileNumber.startsWith('25078') ? 'mtn' : 'airtel';
      
      paymentResponse = await initiateProviderPayment(provider, {
        amount,
        phoneNumber: mobileNumber || req.user.phoneNumber,
        reference: paymentReference,
        description: `Loan repayment for ${loan._id}`
      });
      
      // Update transaction with provider response data
      transaction.metadata = {
        mobileMoneyOperator: provider,
        transactionId: paymentResponse.transactionId,
        gatewayResponse: paymentResponse.data
      };
      
      await transaction.save();
    } else {
      paymentResponse = {
        success: true,
        message: 'Manual payment initiated',
        data: { reference: paymentReference }
      };
    }

    res.status(200).json({
      success: true,
      message: 'Loan repayment initiated successfully',
      data: {
        transactionId: transaction._id,
        paymentReference,
        provider: transaction.metadata?.mobileMoneyOperator || 'manual',
        nextStep: paymentResponse.nextStep || 'Check your phone for payment prompt'
      }
    });
  } catch (error) {
    logger.error('Error initiating loan repayment:', error);
    next(error);
  }
};

/**
 * Process Mobile Money callback from provider
 * @route POST /api/payments/:provider/callback
 * @access Public (Webhook)
 */
exports.mobileMoneyCallback = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const payload = req.body;
    
    logger.info(`Received callback from ${provider}:`, payload);
    
    // Validate that this is a legitimate callback
    if (!validateCallback(provider, req)) {
      logger.error(`Invalid callback received from ${provider}`);
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Extract payment reference and status from the payload
    // This will differ based on the provider's response format
    const { reference, status, transactionId } = extractCallbackData(provider, payload);
    
    if (!reference) {
      logger.error('No payment reference found in callback');
      return res.status(400).json({ success: false, message: 'Invalid callback data' });
    }
    
    // Find the transaction by payment reference
    const transaction = await Transaction.findOne({ paymentReference: reference });
    
    if (!transaction) {
      logger.error(`Transaction not found for reference: ${reference}`);
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    // Update transaction status based on the callback
    if (status === 'SUCCESS' || status === 'SUCCESSFUL') {
      await processSuccessfulPayment(transaction);
    } else if (status === 'FAILED' || status === 'REJECTED') {
      await processFailedPayment(transaction);
    } else {
      transaction.paymentStatus = 'pending'; // Still processing
      await transaction.save();
    }
    
    // Acknowledge receipt to the provider
    res.status(200).json({ success: true, message: 'Callback processed' });
  } catch (error) {
    logger.error('Error processing mobile money callback:', error);
    // Always return 200 to the provider to prevent retries
    res.status(200).json({ success: false, message: 'Error processing callback' });
  }
};

/**
 * Check payment status
 * @route GET /api/payments/:transactionId/status
 * @access Private
 */
exports.checkPaymentStatus = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Check if user is authorized to view this transaction
    if (transaction.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this transaction'
      });
    }
    
    // If payment is still pending and it's a mobile money payment,
    // we might want to check with the provider for the latest status
    if (transaction.paymentStatus === 'pending' && transaction.paymentMethod === 'mobile_money') {
      const provider = transaction.metadata?.mobileMoneyOperator;
      const providerTransactionId = transaction.metadata?.transactionId;
      
      if (provider && providerTransactionId) {
        const statusCheck = await checkProviderPaymentStatus(
          provider,
          providerTransactionId,
          transaction.paymentReference
        );
        
        if (statusCheck.status !== transaction.paymentStatus) {
          transaction.paymentStatus = statusCheck.status;
          transaction.processedAt = new Date();
          await transaction.save();
          
          if (statusCheck.status === 'completed') {
            await processSuccessfulPayment(transaction);
          } else if (statusCheck.status === 'failed') {
            await processFailedPayment(transaction);
          }
        }
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        transactionId: transaction._id,
        paymentReference: transaction.paymentReference,
        amount: transaction.amount,
        status: transaction.paymentStatus,
        processedAt: transaction.processedAt,
        type: transaction.type
      }
    });
  } catch (error) {
    logger.error('Error checking payment status:', error);
    next(error);
  }
};

/**
 * Get user's payment history
 * @route GET /api/payments/history
 * @access Private
 */
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { groupId, type, status, page = 1, limit = 10 } = req.query;
    
    const query = { user: userId };
    
    if (groupId) query.group = groupId;
    if (type) query.type = type;
    if (status) query.paymentStatus = status;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: [
        { path: 'group', select: 'name' },
        { path: 'loan', select: 'amount status dueDate' }
      ]
    };
    
    const transactions = await Transaction.find(query)
      .sort(options.sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .populate(options.populate);
    
    const total = await Transaction.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching payment history:', error);
    next(error);
  }
};

// Helper functions for mobile money integration

/**
 * Initiate a payment with a mobile money provider
 * @param {String} provider - The mobile money provider (mtn or airtel)
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} Payment initiation result
 */
async function initiateProviderPayment(provider, paymentData) {
  try {
    if (provider === 'mtn') {
      return await initiateMTNPayment(paymentData);
    } else if (provider === 'airtel') {
      return await initiateAirtelPayment(paymentData);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    logger.error(`Error initiating ${provider} payment:`, error);
    throw error;
  }
}

/**
 * Initiate MTN Mobile Money payment
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} MTN payment initiation result
 */
async function initiateMTNPayment(paymentData) {
  try {
    const { amount, phoneNumber, reference, description } = paymentData;
    const config = paymentGateways.mtnMomo;
    
    // Generate UUID for transaction
    const transactionId = crypto.randomUUID();
    
    // Format phone number as required by MTN API (remove country code prefix if present)
    const formattedPhone = phoneNumber.replace(/^\+?250/, '');
    
    // Prepare headers as per MTN API requirements
    const headers = {
      'X-Reference-Id': transactionId,
      'X-Target-Environment': config.environment,
      'Ocp-Apim-Subscription-Key': config.primaryKey,
      'Content-Type': 'application/json'
    };
    
    // Prepare request body
    const requestBody = {
      amount: amount.toString(),
      currency: 'RWF',
      externalId: reference,
      payer: {
        partyIdType: 'MSISDN',
        partyId: formattedPhone
      },
      payerMessage: description,
      payeeNote: description
    };
    
    // Use sandbox URL for testing, production URL for live
    const baseUrl = config.environment === 'production'
      ? 'https://mtncameroon.momoapi.mtn.com'
      : 'https://sandbox.momodeveloper.mtn.com';
    
    // Make the API call to initiate payment
    const response = await axios.post(
      `${baseUrl}/collection/v1_0/requesttopay`,
      requestBody,
      { headers }
    );
    
    logger.info(`MTN payment initiated for reference ${reference}:`, {
      transactionId,
      statusCode: response.status
    });
    
    return {
      success: true,
      transactionId,
      nextStep: 'Check your MTN Mobile Money phone for a prompt to approve payment',
      data: {
        reference,
        providerId: transactionId
      }
    };
  } catch (error) {
    logger.error('Error initiating MTN payment:', error.response?.data || error.message);
    throw new Error(`MTN Payment initiation failed: ${error.message}`);
  }
}

/**
 * Initiate Airtel Money payment
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} Airtel payment initiation result
 */
async function initiateAirtelPayment(paymentData) {
  try {
    const { amount, phoneNumber, reference, description } = paymentData;
    const config = paymentGateways.airtelMoney;
    
    // Generate transaction ID
    const transactionId = `AIRTEL-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    
    // Format phone number as required by Airtel API
    const formattedPhone = phoneNumber.replace(/^\+?250/, '250');
    
    // Prepare headers as per Airtel API requirements
    const headers = {
      'X-Country': 'RW',
      'X-Currency': 'RWF',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    };
    
    // Prepare request body
    const requestBody = {
      reference: reference,
      subscriber: {
        country: 'RWA',
        currency: 'RWF',
        msisdn: formattedPhone
      },
      transaction: {
        amount: amount,
        country: 'RWA',
        currency: 'RWF',
        id: transactionId
      },
      description: description
    };
    
    // Use sandbox URL for testing, production URL for live
    const baseUrl = config.environment === 'production'
      ? 'https://openapiuat.airtel.africa'
      : 'https://openapiuat.airtel.africa';
    
    // Make the API call to initiate payment
    const response = await axios.post(
      `${baseUrl}/merchant/v1/payments/`,
      requestBody,
      { headers }
    );
    
    logger.info(`Airtel payment initiated for reference ${reference}:`, {
      transactionId,
      statusCode: response.status,
      data: response.data
    });
    
    return {
      success: true,
      transactionId,
      nextStep: 'Check your Airtel Money phone for a prompt to approve payment',
      data: {
        reference,
        providerId: transactionId,
        airtelData: response.data
      }
    };
  } catch (error) {
    logger.error('Error initiating Airtel payment:', error.response?.data || error.message);
    throw new Error(`Airtel Payment initiation failed: ${error.message}`);
  }
}

/**
 * Validate that a callback is legitimate
 * @param {String} provider - The provider name
 * @param {Object} req - Express request object
 * @returns {Boolean} True if valid, false otherwise
 */
function validateCallback(provider, req) {
  // Implement provider-specific validation
  if (provider === 'mtn') {
    // Check MTN-specific headers or signatures
    // This is a simplified example - real implementation would be more robust
    return true;
  } else if (provider === 'airtel') {
    // Check Airtel-specific validation
    return true;
  }
  return false;
}

/**
 * Extract payment reference and status from callback data
 * @param {String} provider - The provider name
 * @param {Object} payload - The callback payload
 * @returns {Object} Extracted data
 */
function extractCallbackData(provider, payload) {
  if (provider === 'mtn') {
    // Extract data from MTN callback format
    return {
      reference: payload.externalId,
      status: payload.status,
      transactionId: payload.referenceId
    };
  } else if (provider === 'airtel') {
    // Extract data from Airtel callback format
    return {
      reference: payload.reference,
      status: payload.status,
      transactionId: payload.transaction?.id
    };
  }
  
  return { reference: null, status: null, transactionId: null };
}

/**
 * Process a successful payment
 * @param {Object} transaction - Transaction document
 * @returns {Promise<void>}
 */
async function processSuccessfulPayment(transaction) {
  try {
    // Update transaction status
    transaction.paymentStatus = 'completed';
    transaction.processedAt = new Date();
    await transaction.save();
    
    // Process based on transaction type
    if (transaction.type === 'contribution') {
      await processContribution(transaction);
    } else if (transaction.type === 'loan_repayment') {
      await processLoanRepayment(transaction);
    }
    
    // Send notification
    const user = await User.findById(transaction.user);
    await createNotification({
      recipient: transaction.user,
      group: transaction.group,
      type: transaction.type,
      title: 'Payment Successful',
      message: `Your ${transaction.amount} RWF ${transaction.type.replace('_', ' ')} payment was successful.`,
      channels: ['in_app', user.phoneNumber ? 'sms' : null].filter(Boolean),
      priority: 'normal',
      relatedTo: {
        model: 'Transaction',
        id: transaction._id
      }
    });
    
  } catch (error) {
    logger.error('Error processing successful payment:', error);
    throw error;
  }
}

/**
 * Process a failed payment
 * @param {Object} transaction - Transaction document
 * @returns {Promise<void>}
 */
async function processFailedPayment(transaction) {
  try {
    // Update transaction status
    transaction.paymentStatus = 'failed';
    transaction.processedAt = new Date();
    await transaction.save();
    
    // Send notification
    const user = await User.findById(transaction.user);
    await createNotification({
      recipient: transaction.user,
      group: transaction.group,
      type: transaction.type,
      title: 'Payment Failed',
      message: `Your ${transaction.amount} RWF ${transaction.type.replace('_', ' ')} payment has failed. Please try again.`,
      channels: ['in_app', user.phoneNumber ? 'sms' : null].filter(Boolean),
      priority: 'high',
      relatedTo: {
        model: 'Transaction',
        id: transaction._id
      }
    });
  } catch (error) {
    logger.error('Error processing failed payment:', error);
    throw error;
  }
}

/**
 * Process a successful contribution payment
 * @param {Object} transaction - Transaction document
 * @returns {Promise<void>}
 */
async function processContribution(transaction) {
  try {
    // Update group funds
    const group = await Group.findById(transaction.group);
    
    if (!group) {
      throw new Error(`Group not found for transaction ${transaction._id}`);
    }
    
    // Update group's total savings and available funds
    group.totalSavings += transaction.amount;
    group.availableFunds += transaction.amount;
    await group.save();
    
    logger.info(`Updated group funds for ${group.name}:`, {
      transactionId: transaction._id,
      newTotalSavings: group.totalSavings,
      newAvailableFunds: group.availableFunds
    });
  } catch (error) {
    logger.error(`Error processing contribution for transaction ${transaction._id}:`, error);
    throw error;
  }
}

/**
 * Process a successful loan repayment
 * @param {Object} transaction - Transaction document
 * @returns {Promise<void>}
 */
async function processLoanRepayment(transaction) {
  try {
    // Update loan details
    const loan = await Loan.findById(transaction.loan);
    
    if (!loan) {
      throw new Error(`Loan not found for transaction ${transaction._id}`);
    }
    
    // Update loan amount paid and remaining
    loan.amountPaid += transaction.amount;
    loan.remainingAmount -= transaction.amount;
    
    // Check if loan is fully paid
    if (loan.remainingAmount <= 0) {
      loan.status = 'paid';
      loan.remainingAmount = 0;
    }
    
    // Update payment schedule if applicable
    if (loan.paymentSchedule && loan.paymentSchedule.length > 0) {
      let remainingAmount = transaction.amount;
      
      // Apply payment to schedule items, starting with oldest
      for (const payment of loan.paymentSchedule.filter(p => p.status === 'pending' || p.status === 'overdue')) {
        if (remainingAmount <= 0) break;
        
        const amountToApply = Math.min(remainingAmount, payment.amount - payment.paidAmount);
        payment.paidAmount += amountToApply;
        remainingAmount -= amountToApply;
        
        if (payment.paidAmount >= payment.amount) {
          payment.status = 'paid';
          payment.paidOn = new Date();
        }
      }
    }
    
    // Update last payment date
    loan.lastPaymentDate = new Date();
    
    // Calculate next payment due if not fully paid
    if (loan.status !== 'paid') {
      const nextPayment = loan.paymentSchedule?.find(p => p.status !== 'paid');
      if (nextPayment) {
        loan.nextPaymentDue = nextPayment.dueDate;
      }
    }
    
    await loan.save();
    
    // Update group available funds
    const group = await Group.findById(loan.group);
    if (group) {
      group.availableFunds += transaction.amount;
      await group.save();
    }
    
    logger.info(`Processed loan repayment for loan ${loan._id}:`, {
      transactionId: transaction._id,
      amountPaid: transaction.amount,
      totalPaid: loan.amountPaid,
      remaining: loan.remainingAmount,
      status: loan.status
    });
    
    // Send notification if loan is fully paid
    if (loan.status === 'paid') {
      const user = await User.findById(loan.user);
      await createNotification({
        recipient: loan.user,
        group: loan.group,
        type: 'loan_repayment',
        title: 'Loan Fully Repaid',
        message: `Congratulations! You have completely repaid your loan of ${loan.totalAmount} RWF.`,
        channels: ['in_app', user.phoneNumber ? 'sms' : null].filter(Boolean),
        priority: 'normal',
        relatedTo: {
          model: 'Loan',
          id: loan._id
        }
      });
    }
  } catch (error) {
    logger.error(`Error processing loan repayment for transaction ${transaction._id}:`, error);
    throw error;
  }
}

/**
 * Check payment status with provider
 * @param {String} provider - The provider name
 * @param {String} providerTransactionId - Provider's transaction ID
 * @param {String} reference - Payment reference
 * @returns {Promise<Object>} Payment status
 */
async function checkProviderPaymentStatus(provider, providerTransactionId, reference) {
  try {
    if (provider === 'mtn') {
      return await checkMTNPaymentStatus(providerTransactionId, reference);
    } else if (provider === 'airtel') {
      return await checkAirtelPaymentStatus(providerTransactionId, reference);
    }
    
    return { status: 'unknown' };
  } catch (error) {
    logger.error(`Error checking ${provider} payment status:`, error);
    return { status: 'error', error: error.message };
  }
}

/**
 * Check MTN payment status
 * @param {String} transactionId - MTN transaction ID
 * @param {String} reference - Payment reference
 * @returns {Promise<Object>} Payment status
 */
async function checkMTNPaymentStatus(transactionId, reference) {
  try {
    const config = paymentGateways.mtnMomo;
    
    // Prepare headers as per MTN API requirements
    const headers = {
      'X-Target-Environment': config.environment,
      'Ocp-Apim-Subscription-Key': config.primaryKey
    };
    
    // Use sandbox URL for testing, production URL for live
    const baseUrl = config.environment === 'production'
      ? 'https://mtncameroon.momoapi.mtn.com'
      : 'https://sandbox.momodeveloper.mtn.com';
    
    // Make the API call to check payment status
    const response = await axios.get(
      `${baseUrl}/collection/v1_0/requesttopay/${transactionId}`,
      { headers }
    );
    
    logger.info(`MTN payment status check for reference ${reference}:`, {
      transactionId,
      statusCode: response.status,
      status: response.data.status
    });
    
    // Map MTN status to our system status
    const statusMap = {
      'SUCCESSFUL': 'completed',
      'FAILED': 'failed',
      'PENDING': 'pending',
      'REJECTED': 'failed',
      'TIMEOUT': 'failed',
      'ONGOING': 'pending'
    };
    
    return {
      status: statusMap[response.data.status] || 'pending',
      providerStatus: response.data.status
    };
  } catch (error) {
    logger.error('Error checking MTN payment status:', error.response?.data || error.message);
    throw new Error(`MTN Payment status check failed: ${error.message}`);
  }
}

/**
 * Check Airtel payment status
 * @param {String} transactionId - Airtel transaction ID
 * @param {String} reference - Payment reference
 * @returns {Promise<Object>} Payment status
 */
async function checkAirtelPaymentStatus(transactionId, reference) {
  try {
    const config = paymentGateways.airtelMoney;
    
    // Prepare headers as per Airtel API requirements
    const headers = {
      'X-Country': 'RW',
      'X-Currency': 'RWF',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    };
    
    // Use sandbox URL for testing, production URL for live
    const baseUrl = config.environment === 'production'
      ? 'https://openapiuat.airtel.africa'
      : 'https://openapiuat.airtel.africa';
    
    // Make the API call to check payment status
    const response = await axios.get(
      `${baseUrl}/standard/v1/payments/${transactionId}`,
      { headers }
    );
    
    logger.info(`Airtel payment status check for reference ${reference}:`, {
      transactionId,
      statusCode: response.status,
      status: response.data.status
    });
    
    // Map Airtel status to our system status
    const statusMap = {
      'SUCCESS': 'completed',
      'FAILED': 'failed',
      'PENDING': 'pending',
      'REJECTED': 'failed',
      'TIMEOUT': 'failed'
    };
    
    return {
      status: statusMap[response.data.status] || 'pending',
      providerStatus: response.data.status
    };
  } catch (error) {
    logger.error('Error checking Airtel payment status:', error.response?.data || error.message);
    throw new Error(`Airtel Payment status check failed: ${error.message}`);
  }
}

/**
 * @desc    Initiate a payment via mobile money
 * @route   POST /api/payments/mobile-money/initiate
 * @access  Private
 */
exports.initiateMobileMoneyPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { amount, phoneNumber, paymentType, groupId, description } = req.body;

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate phone number format (simple validation)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Check if group exists if groupId is provided
    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }

      // Check if user is a member of this group
      const isMember = group.members.some(
        member => member.user.toString() === req.user.id
      );

      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'You must be a member of the group to make a contribution'
        });
      }
    }

    // Create a new transaction record
    const transaction = new Transaction({
      user: req.user.id,
      amount,
      currency: 'RWF', // Default currency for now
      type: paymentType || 'contribution',
      method: 'mobile_money',
      status: 'pending',
      description: description || 'Mobile money payment',
      group: groupId,
      paymentDetails: {
        phoneNumber,
        provider: 'mtn', // Default provider, could be dynamic
        reference: `MM-${Date.now()}-${Math.floor(Math.random() * 1000)}` // Generate unique reference
      }
    });

    await transaction.save();

    // In a real implementation, this would make an API call to the mobile money provider
    // For now, we'll simulate a successful request
    
    logger.info(`Initiated mobile money payment: ${amount} RWF for user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Mobile money payment initiated. Please confirm on your phone.',
      data: {
        transactionId: transaction._id,
        reference: transaction.paymentDetails.reference,
        amount,
        status: 'pending'
      }
    });
  } catch (error) {
    logger.error('Error initiating mobile money payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Verify payment status
 * @route   GET /api/payments/verify/:transactionId
 * @access  Private
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user is authorized to view this transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this transaction'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        transactionId: transaction._id,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        dateInitiated: transaction.createdAt,
        dateCompleted: transaction.completedAt
      }
    });
  } catch (error) {
    logger.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Handle mobile money callback
 * @route   POST /api/payments/:provider/callback
 * @access  Public (accessed by payment provider)
 */
exports.mobileMoneyCallback = async (req, res) => {
  try {
    const { provider } = req.params;
    const { reference, status, transactionId } = req.body;

    logger.info(`Received callback from ${provider}: ${JSON.stringify(req.body)}`);

    // Find the transaction by reference
    const transaction = await Transaction.findOne({ 
      'paymentDetails.reference': reference 
    });

    if (!transaction) {
      logger.error(`Transaction with reference ${reference} not found`);
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Update transaction status
    transaction.status = status === 'success' ? 'completed' : 'failed';
    if (status === 'success') {
      transaction.completedAt = new Date();
    }
    
    // Save external transaction ID from provider
    if (transactionId) {
      transaction.paymentDetails.externalTransactionId = transactionId;
    }

    await transaction.save();

    // If payment was successful and it's a contribution, update group financials
    if (status === 'success' && transaction.type === 'contribution' && transaction.group) {
      const group = await Group.findById(transaction.group);
      
      if (group) {
        // Update financial summary
        group.financialSummary.totalSavings += transaction.amount;
        group.financialSummary.availableFunds += transaction.amount;
        
        // Update member contribution record
        const memberIndex = group.members.findIndex(
          m => m.user.toString() === transaction.user.toString()
        );
        
        if (memberIndex !== -1) {
          group.members[memberIndex].contributions.paid += transaction.amount;
          group.members[memberIndex].contributions.lastPaid = new Date();
        }
        
        await group.save();
      }
    }

    // Return success to the provider
    res.status(200).json({
      success: true,
      message: 'Callback processed successfully'
    });
  } catch (error) {
    logger.error('Error processing mobile money callback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get user payment history
 * @route   GET /api/payments/history
 * @access  Private
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const { type, status, limit = 10, page = 1 } = req.query;
    
    const query = { user: req.user.id };
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    const options = {
      sort: { createdAt: -1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      populate: 'group'
    };
    
    const transactions = await Transaction.find(query, null, options);
    const total = await Transaction.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = exports; 