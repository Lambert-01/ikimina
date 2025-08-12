import api from './api';

export interface LoginCredentials {
  phoneNumber: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  language?: string;
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  roles: string[];
  primaryRole: string;
  memberOfGroups: any[];
  managerOfGroups: any[];
  token: string;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  permissions: string[];
  token: string;
}

const authService = {
  /**
   * Login with credentials
   */
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data && response.data.success && response.data.data) {
        const userData = response.data.data;
        
        // Store token and basic user info
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('userName', `${userData.firstName} ${userData.lastName}`);
        
        // Store roles as JSON string
        if (userData.roles) {
          localStorage.setItem('userRoles', JSON.stringify(userData.roles));
        }
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  /**
   * Register a new user
   */
  register: async (userData: RegisterData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data && response.data.success && response.data.data) {
        const newUser = response.data.data;
        
        // Store token and basic user info
        localStorage.setItem('token', newUser.token);
        localStorage.setItem('userId', newUser.id);
        localStorage.setItem('userName', `${newUser.firstName} ${newUser.lastName}`);
        
        // Store roles as JSON string
        if (newUser.roles) {
          localStorage.setItem('userRoles', JSON.stringify(newUser.roles));
        }
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRoles');
  },
  
  /**
   * Check if user is logged in
   */
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },
  
  /**
   * Get current user's data
   */
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  /**
   * Update user's profile
   */
  updateProfile: async (profileData: any) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data && response.data.success && response.data.data) {
        const updatedUser = response.data.data;
        localStorage.setItem('userName', `${updatedUser.firstName} ${updatedUser.lastName}`);
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  /**
   * Change user's password
   */
  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  /**
   * Get token from localStorage
   */
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  /**
   * Get user ID from localStorage
   */
  getUserId: () => {
    return localStorage.getItem('userId');
  },
  
  /**
   * Get user name from localStorage
   */
  getUserName: () => {
    return localStorage.getItem('userName');
  },
  
  /**
   * Get user roles from localStorage
   */
  getUserRoles: () => {
    const rolesStr = localStorage.getItem('userRoles');
    return rolesStr ? JSON.parse(rolesStr) : ['member'];
  },
  
  /**
   * Send verification code to phone number
   */
  sendVerificationCode: async (phoneNumber: string) => {
    try {
      const response = await api.post('/auth/send-verification', { phoneNumber });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  /**
   * Verify OTP code
   */
  verifyOtp: async (phoneNumber: string, otpCode: string) => {
    try {
      const response = await api.post('/auth/verify-otp', { phoneNumber, otpCode });
      return response.data.success;
    } catch (error: any) {
      return false;
    }
  },

  /**
   * Admin login with email and password
   */
  adminLogin: async (credentials: AdminLoginCredentials) => {
    try {
      // Sanitize credentials
      const payload = {
        email: (credentials.email || '').trim().toLowerCase(),
        password: (credentials.password || '').trim()
      };
      const response = await api.post('/admin/auth/login', payload);
      
      if (response.data && response.data.success && response.data.data) {
        const adminData = response.data.data;
        
        // Store admin token and info with different keys
        localStorage.setItem('adminToken', adminData.token);
        localStorage.setItem('adminId', adminData.admin.id);
        localStorage.setItem('adminName', `${adminData.admin.firstName} ${adminData.admin.lastName}`);
        localStorage.setItem('adminEmail', adminData.admin.email);
        localStorage.setItem('adminRole', adminData.admin.role);
        localStorage.setItem('adminPermissions', JSON.stringify(adminData.admin.permissions));
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Admin logout
   */
  adminLogout: async () => {
    try {
      // Call API logout endpoint
      await api.post('/admin/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
    } catch (error) {
      // Continue with local logout even if API call fails
    } finally {
      // Clear admin session data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminName');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminRole');
      localStorage.removeItem('adminPermissions');
    }
  },

  /**
   * Check if admin is logged in
   */
  isAdminLoggedIn: () => {
    return !!localStorage.getItem('adminToken');
  },

  /**
   * Get admin token
   */
  getAdminToken: () => {
    return localStorage.getItem('adminToken');
  },

  /**
   * Get admin data from localStorage
   */
  getAdminData: () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return null;

    return {
      id: localStorage.getItem('adminId'),
      firstName: localStorage.getItem('adminName')?.split(' ')[0] || '',
      lastName: localStorage.getItem('adminName')?.split(' ')[1] || '',
      email: localStorage.getItem('adminEmail'),
      role: localStorage.getItem('adminRole'),
      permissions: JSON.parse(localStorage.getItem('adminPermissions') || '[]'),
      token
    };
  },

  /**
   * Check if admin has specific permission
   */
  hasAdminPermission: (permission: string) => {
    const adminRole = localStorage.getItem('adminRole');
    const adminPermissions = JSON.parse(localStorage.getItem('adminPermissions') || '[]');
    
    // Super admin has all permissions
    if (adminRole === 'super_admin') return true;
    
    return adminPermissions.includes(permission);
  },

  /**
   * Get current admin profile
   */
  getAdminProfile: async () => {
    try {
      const response = await api.get('/admin/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Update admin profile
   */
  updateAdminProfile: async (profileData: { firstName?: string; lastName?: string }) => {
    try {
      const response = await api.put('/admin/auth/profile', profileData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.data && response.data.success && response.data.data) {
        const updatedAdmin = response.data.data;
        localStorage.setItem('adminName', `${updatedAdmin.firstName} ${updatedAdmin.lastName}`);
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Change admin password
   */
  changeAdminPassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await api.put('/admin/auth/change-password', passwordData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
};

export default authService; 