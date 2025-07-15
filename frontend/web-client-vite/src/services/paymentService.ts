import api from './api';

interface PaymentRequest {
  amount: number;
  paymentProvider: 'MTN' | 'AIRTEL';
  phoneNumber: string;
  description: string;
  groupId?: string;
  contributionCycleId?: string;
  loanId?: string;
}

interface LinkPaymentProviderData {
  provider: 'MTN' | 'AIRTEL';
  phoneNumber: string;
  accountName?: string;
}

export const paymentService = {
  // Make a contribution payment
  makeContribution: async (groupId: string, cycleId: string, paymentData: Omit<PaymentRequest, 'groupId' | 'contributionCycleId'>) => {
    const request = {
      ...paymentData,
      groupId,
      contributionCycleId: cycleId
    };
    const response = await api.post('/payments/contribution', request);
    return response.data;
  },

  // Make a loan repayment
  makeRepayment: async (loanId: string, paymentData: Omit<PaymentRequest, 'loanId'>) => {
    const request = {
      ...paymentData,
      loanId
    };
    const response = await api.post('/payments/loan-repayment', request);
    return response.data;
  },

  // Get payment transaction history
  getTransactionHistory: async (filters?: object) => {
    const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
    const response = await api.get(`/payments/transactions?${queryParams}`);
    return response.data;
  },

  // Get specific transaction details
  getTransactionById: async (transactionId: string) => {
    const response = await api.get(`/payments/transactions/${transactionId}`);
    return response.data;
  },
  
  // Link payment provider to user account
  linkPaymentProvider: async (data: LinkPaymentProviderData) => {
    const response = await api.post('/payments/link-provider', data);
    return response.data;
  },
  
  // Get user linked payment providers
  getLinkedProviders: async () => {
    const response = await api.get('/payments/linked-providers');
    return response.data;
  },
  
  // Verify payment transaction status
  verifyTransactionStatus: async (transactionId: string) => {
    const response = await api.get(`/payments/verify/${transactionId}`);
    return response.data;
  },
  
  // Check if a payment is in progress (to prevent double payments)
  checkPaymentInProgress: async (resourceType: 'contribution' | 'loan', resourceId: string) => {
    const response = await api.get(`/payments/status/${resourceType}/${resourceId}`);
    return response.data;
  }
};

export default paymentService; 