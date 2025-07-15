import api from './api';

interface LoginCredentials {
  phoneNumber?: string;
  email?: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  language?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    role: string;
    token: string;
  };
}

const authService = {
  /**
   * Login user with email/phone and password
   */
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      if (response.data.success && response.data.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterData) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      
      if (response.data.success && response.data.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get current user info
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get<AuthResponse>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }
};

export default authService; 