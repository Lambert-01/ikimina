import api from './api';

interface LoanRequest {
  groupId: string;
  purpose: string;
  requestedAmount: number;
  term: number;
  interestRate: number;
  currency: string;
  collateral: {
    type: string;
    value: number;
    description: string;
  };
}

interface VoteData {
  vote: 'approve' | 'reject';
  comment?: string;
}

export const loanService = {
  // Request a loan from group fund
  requestLoan: async (loanData: LoanRequest) => {
    const response = await api.post('/loans/request', loanData);
    return response.data;
  },
  
  // Get all loans (no filter)
  getLoans: async () => {
    const response = await api.get('/loans');
    return response.data;
  },
  
  // Get all user's loans (as borrower)
  getUserLoans: async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    const response = await api.get(`/loans/user${query}`);
    return response.data;
  },
  
  // Get loans for a specific group
  getGroupLoans: async (groupId: string, status?: string) => {
    const query = status ? `?status=${status}` : '';
    const response = await api.get(`/loans/group/${groupId}${query}`);
    return response.data;
  },
  
  // Get details of a specific loan
  getLoanById: async (loanId: string) => {
    const response = await api.get(`/loans/${loanId}`);
    return response.data;
  },
  
  // Vote on a loan request
  voteOnLoan: async (loanId: string, voteData: VoteData) => {
    const response = await api.post(`/loans/${loanId}/vote`, voteData);
    return response.data;
  },
  
  // Get voting results for a loan
  getVotingResults: async (loanId: string) => {
    const response = await api.get(`/loans/${loanId}/votes`);
    return response.data;
  },
  
  // Get repayment schedule for a loan
  getRepaymentSchedule: async (loanId: string) => {
    const response = await api.get(`/loans/${loanId}/schedule`);
    return response.data;
  },
  
  // Calculate potential loan details before requesting
  calculateLoan: async (groupId: string, amount: number, term: number) => {
    const response = await api.post('/loans/calculate', { 
      groupId, 
      amount, 
      term 
    });
    return response.data;
  },
  
  // Cancel a loan request (if still pending)
  cancelLoanRequest: async (loanId: string) => {
    const response = await api.post(`/loans/${loanId}/cancel`);
    return response.data;
  }
};

export default loanService; 