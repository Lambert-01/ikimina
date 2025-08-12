import api from './api';

// Types
export interface ContributionPayment {
  groupId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
}

export interface Transaction {
  _id: string;
  user: string;
  group: {
    _id: string;
    name: string;
  };
  type: 'contribution' | 'loan_repayment' | 'loan_disbursement' | 'withdrawal';
  amount: number;
  paymentMethod: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionSummary {
  totalContributed: number;
  contributionsByGroup: Array<{
    groupId: string;
    groupName: string;
    total: number;
  }>;
  upcomingContributions: Array<{
    groupId: string;
    groupName: string;
    amount: number;
    dueDate: string;
  }>;
}

export interface OverdueContribution {
  groupId: string;
  groupName: string;
  amount: number;
  daysOverdue: number;
}

export interface PaymentMethod {
  _id: string;
  provider: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
  isPrimary: boolean;
  verifiedAt?: string;
}

// Make a contribution payment
export const makeContribution = async (paymentData: ContributionPayment) => {
  const response = await api.post('/api/payments/contribution', paymentData);
  return response.data;
};

// Get contribution history
export const getContributionHistory = async (params?: {
  groupId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}) => {
  const response = await api.get('/api/payments/contributions', { params });
  return response.data;
};

// Get contribution summary
export const getContributionSummary = async (groupId?: string) => {
  const response = await api.get('/api/payments/contributions/summary', {
    params: groupId ? { groupId } : {}
  });
  return response.data;
};

// Get overdue contributions
export const getOverdueContributions = async () => {
  const response = await api.get('/api/payments/contributions/overdue');
  return response.data;
};

// Get payment methods
export const getPaymentMethods = async () => {
  const response = await api.get('/api/payments/methods');
  return response.data;
};

// Add payment method
export const addPaymentMethod = async (paymentMethod: {
  provider: string;
  accountNumber: string;
  accountName: string;
  isPrimary?: boolean;
}) => {
  const response = await api.post('/api/payments/methods', paymentMethod);
  return response.data;
};

// Remove payment method
export const removePaymentMethod = async (methodId: string) => {
  const response = await api.delete(`/api/payments/methods/${methodId}`);
  return response.data;
};

export default {
  makeContribution,
  getContributionHistory,
  getContributionSummary,
  getOverdueContributions,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod
}; 