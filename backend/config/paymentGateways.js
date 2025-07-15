/**
 * Payment Gateway Integration Configuration for IKIMINA
 * Configured for Rwanda's mobile money providers: MTN MoMo and Airtel Money
 */
require('dotenv').config();
const winston = require('winston');

const paymentGateways = {
  mtn: {
    name: 'MTN Mobile Money',
    code: 'MTN',
    enabled: process.env.MTN_MOMO_ENABLED === 'true',
    api: {
      baseUrl: process.env.MTN_MOMO_API_URL || 'https://sandbox.momodeveloper.mtn.com',
      version: process.env.MTN_MOMO_API_VERSION || 'v1_0',
      primaryKey: process.env.MTN_MOMO_PRIMARY_KEY,
      secondaryKey: process.env.MTN_MOMO_SECONDARY_KEY,
      userId: process.env.MTN_MOMO_USER_ID,
      userSecret: process.env.MTN_MOMO_USER_SECRET,
      callbackHost: process.env.BACKEND_URL || 'http://localhost:5000',
      callbackPath: '/api/payments/callbacks/mtn',
      collections: {
        subscriptionKey: process.env.MTN_MOMO_COLLECTIONS_KEY,
        apiUserId: process.env.MTN_MOMO_COLLECTIONS_USER_ID
      },
      disbursements: {
        subscriptionKey: process.env.MTN_MOMO_DISBURSEMENTS_KEY,
        apiUserId: process.env.MTN_MOMO_DISBURSEMENTS_USER_ID
      }
    },
    credentials: {
      providerCallbackUrl: process.env.MTN_MOMO_CALLBACK_URL,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
    }
  },
  
  airtel: {
    name: 'Airtel Money',
    code: 'AIRTEL',
    enabled: process.env.AIRTEL_ENABLED === 'true',
    api: {
      baseUrl: process.env.AIRTEL_API_URL || 'https://openapi.airtel.africa',
      version: process.env.AIRTEL_API_VERSION || 'v1',
      clientId: process.env.AIRTEL_CLIENT_ID,
      clientSecret: process.env.AIRTEL_CLIENT_SECRET,
      callbackHost: process.env.BACKEND_URL || 'http://localhost:5000',
      callbackPath: '/api/payments/callbacks/airtel'
    },
    credentials: {
      providerCallbackUrl: process.env.AIRTEL_CALLBACK_URL,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
    }
  },
  
  // Configuration shared across providers
  shared: {
    transactionTypes: {
      CONTRIBUTION: 'CONTRIBUTION',
      LOAN_DISBURSEMENT: 'LOAN_DISBURSEMENT',
      LOAN_REPAYMENT: 'LOAN_REPAYMENT',
      PAYOUT: 'PAYOUT',
      REFUND: 'REFUND',
      FEE: 'FEE'
    },
    
    transactionStatuses: {
      INITIATED: 'INITIATED',
      PENDING: 'PENDING',
      SUCCESSFUL: 'SUCCESSFUL',
      FAILED: 'FAILED',
      CANCELLED: 'CANCELLED',
      EXPIRED: 'EXPIRED'
    },
    
    // Transaction retry settings
    retrySettings: {
      maxAttempts: parseInt(process.env.PAYMENT_MAX_RETRY_ATTEMPTS) || 3,
      retryInterval: parseInt(process.env.PAYMENT_RETRY_INTERVAL) || 60000, // 1 minute in ms
    },
    
    // Transaction verification settings
    verificationSettings: {
      autoVerify: process.env.PAYMENT_AUTO_VERIFY === 'true',
      verifyAfter: parseInt(process.env.PAYMENT_VERIFY_AFTER) || 30000, // 30 seconds in ms
      verificationInterval: parseInt(process.env.PAYMENT_VERIFICATION_INTERVAL) || 300000, // 5 minutes in ms
      maxVerificationAttempts: parseInt(process.env.PAYMENT_MAX_VERIFICATION_ATTEMPTS) || 10
    },
    
    // Fee settings
    fees: {
      contributionFeePercentage: parseFloat(process.env.CONTRIBUTION_FEE_PERCENTAGE) || 0.5,
      loanFeePercentage: parseFloat(process.env.LOAN_FEE_PERCENTAGE) || 1.0,
      minimumFee: parseInt(process.env.MINIMUM_FEE) || 100, // in RWF
      maximumFee: parseInt(process.env.MAXIMUM_FEE) || 2000 // in RWF
    },
    
    // Currency settings
    currency: {
      code: process.env.CURRENCY_CODE || 'RWF',
      name: 'Rwandan Franc',
      symbol: 'RWF',
      decimalPlaces: 0 // RWF has no decimal places
    }
  }
};

// Configure payment logging
const paymentLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'payment-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/payments.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

module.exports = {
  gateways: paymentGateways,
  logger: paymentLogger
};
