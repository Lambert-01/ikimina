import axios from 'axios';

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';
const DEV_AUTH_TOKEN = 'dev-auth-token-ikimina-123';

// Get API URL from environment variables or use fallback with the correct path
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';
console.log('Using API URL:', API_URL, 'in', isDevelopment ? 'development' : 'production', 'mode');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable cookies and authorization headers
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // In development mode, add special header for auth bypass
      if (isDevelopment && token === DEV_AUTH_TOKEN) {
        config.headers['X-Dev-Auth-Bypass'] = 'true';
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      
      // In development mode with auth bypass, don't reject authentication errors
      if (isDevelopment && localStorage.getItem('token') === DEV_AUTH_TOKEN && 
          error.message.includes('401')) {
        console.log('DEV MODE: Ignoring authentication error');
        return Promise.resolve({
          data: {
            success: true,
            message: 'Operation successful (Dev Mode)',
            data: {}
          }
        });
      }
      
      // Return a standardized error format
      return Promise.reject({
        response: {
          data: {
            message: 'Network error. Please check your connection and try again.',
            error: error.message
          },
          status: 0
        }
      });
    }
    
    const { response } = error;
    
    // Handle token expiration
    if (response && response.status === 401) {
      // In development mode with the special token, don't redirect
      if (isDevelopment && localStorage.getItem('token') === DEV_AUTH_TOKEN) {
        console.log('DEV MODE: Ignoring 401 Unauthorized error');
        return Promise.resolve({
          data: {
            success: true,
            message: 'Operation successful (Dev Mode)',
            data: {}
          }
        });
      }
      
      // Otherwise handle normally
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle server errors
    if (response && response.status >= 500) {
      console.error('Server error:', error);
      // Could implement centralized error logging here
      
      // In development mode, provide more helpful message
      if (isDevelopment) {
        console.log('DEV MODE: Server error details:', response.data);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 