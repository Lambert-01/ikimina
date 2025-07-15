import api from './api';

interface DashboardResponse {
  success: boolean;
  data: {
    groups: any[];
    contributions: any;
    recentContributions: any[];
    loans: any;
    upcomingEvents: any[];
    announcements: any[];
  };
}

interface GroupsResponse {
  success: boolean;
  count: number;
  data: any[];
}

interface ContributionsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: any[];
}

interface LoansResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: any[];
}

interface LoanRequestData {
  groupId: string;
  amount: number;
  duration: number;
  purpose: string;
  guarantors?: string[];
}

interface NotificationsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: any[];
}

const memberService = {
  /**
   * Get member dashboard data
   */
  getDashboard: async () => {
    try {
      const response = await api.get<DashboardResponse>('/members/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get dashboard error:', error);
      throw error;
    }
  },

  /**
   * Get member groups
   */
  getGroups: async () => {
    try {
      const response = await api.get<GroupsResponse>('/members/groups');
      return response.data;
    } catch (error) {
      console.error('Get groups error:', error);
      throw error;
    }
  },

  /**
   * Get member contributions
   */
  getContributions: async (params = {}) => {
    try {
      const response = await api.get<ContributionsResponse>('/members/contributions', { params });
      return response.data;
    } catch (error) {
      console.error('Get contributions error:', error);
      throw error;
    }
  },

  /**
   * Get member loans
   */
  getLoans: async (params = {}) => {
    try {
      const response = await api.get<LoansResponse>('/members/loans', { params });
      return response.data;
    } catch (error) {
      console.error('Get loans error:', error);
      throw error;
    }
  },

  /**
   * Request a loan
   */
  requestLoan: async (loanData: LoanRequestData) => {
    try {
      const response = await api.post('/members/loans', loanData);
      return response.data;
    } catch (error) {
      console.error('Request loan error:', error);
      throw error;
    }
  },

  /**
   * Get member notifications
   */
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get<NotificationsResponse>('/members/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   */
  markNotificationAsRead: async (notificationId: string) => {
    try {
      const response = await api.put(`/members/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  },

  /**
   * Get member profile
   */
  getProfile: async () => {
    try {
      const response = await api.get('/members/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  /**
   * Update member profile
   */
  updateProfile: async (profileData: any) => {
    try {
      const response = await api.put('/members/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

export default memberService; 