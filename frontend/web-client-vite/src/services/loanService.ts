import api from './api';

// Types
export interface LoanRequest {
  groupId: string;
  amount: number;
  purpose: string;
  duration: number; // in days
}

export interface Loan {
  _id: string;
  borrower: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  group: {
    _id: string;
    name: string;
  };
  amount: number;
  interest: number;
  totalRepayment: number;
  repaidAmount: number;
  purpose: string;
  duration: number;
  dueDate: string;
  status: 'voting' | 'pending' | 'approved' | 'active' | 'rejected' | 'repaid' | 'defaulted';
  statusReason?: string;
  votes?: {
    required: number;
    approvals: number;
    rejections: number;
    voters: string[];
  };
  disbursedAt?: string;
  repaidAt?: string;
  repayments: Array<{
    amount: number;
    date: string;
    transaction: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRepayment {
  loanId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
}

// Request a loan
export const requestLoan = async (loanData: LoanRequest) => {
  const response = await api.post('/api/loans/request', loanData);
  return response.data;
};

// Get user's loans
export const getMyLoans = async (params?: {
  status?: string;
  groupId?: string;
}) => {
  const response = await api.get('/api/loans/my-loans', { params });
  return response.data;
};

// Get loans for a group
export const getGroupLoans = async (groupId: string, params?: {
  status?: string;
}) => {
  const response = await api.get(`/api/loans/group/${groupId}`, { params });
  return response.data;
};

// Get loan details
export const getLoanById = async (loanId: string) => {
  const response = await api.get(`/api/loans/${loanId}`);
  return response.data;
};

// Update loan status (approve/reject)
export const updateLoanStatus = async (loanId: string, data: {
  status: 'approved' | 'rejected';
  reason?: string;
}) => {
  const response = await api.put(`/api/loans/${loanId}/status`, data);
  return response.data;
};

// Vote on a loan
export const voteLoan = async (loanId: string, vote: 'approve' | 'reject') => {
  const response = await api.post(`/api/loans/${loanId}/vote`, { vote });
  return response.data;
};

// Repay a loan
export const repayLoan = async (loanId: string, repaymentData: {
  amount: number;
  paymentMethod: string;
  reference?: string;
}) => {
  const response = await api.post(`/api/loans/${loanId}/repay`, repaymentData);
  return response.data;
};

export default {
  requestLoan,
  getMyLoans,
  getGroupLoans,
  getLoanById,
  updateLoanStatus,
  voteLoan,
  repayLoan
}; 