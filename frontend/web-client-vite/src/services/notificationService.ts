import api from './api';

interface NotificationSettings {
  enableInApp: boolean;
  enableEmail: boolean;
  enableSMS: boolean;
  contributionReminders: boolean;
  loanReminders: boolean;
  groupUpdates: boolean;
  systemUpdates: boolean;
}

export const notificationService = {
  // Get all notifications for the current user
  getNotifications: async (page = 1, limit = 20) => {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },
  
  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
  
  // Delete a notification
  deleteNotification: async (notificationId: string) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },
  
  // Get notification count (unread)
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
  
  // Update notification settings
  updateSettings: async (settings: Partial<NotificationSettings>) => {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  },
  
  // Get current notification settings
  getSettings: async () => {
    const response = await api.get('/notifications/settings');
    return response.data;
  },
  
  // Subscribe to SMS notifications
  subscribeSMS: async (phoneNumber: string) => {
    const response = await api.post('/notifications/subscribe-sms', { phoneNumber });
    return response.data;
  },
  
  // Verify SMS subscription (with OTP)
  verifySMSSubscription: async (phoneNumber: string, otp: string) => {
    const response = await api.post('/notifications/verify-sms', { phoneNumber, otp });
    return response.data;
  }
};

export default notificationService; 