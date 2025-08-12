import axios from 'axios';
import type { AxiosResponse } from 'axios';

// Define base URL - prefer Vite env when available, fallback to localhost
const BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env && ((import.meta as any).env.VITE_API_URL || (import.meta as any).env.VITE_BACKEND_URL)) ||
  (typeof process !== 'undefined' && (process as any).env && (((process as any).env.VITE_API_URL) || ((process as any).env.VITE_BACKEND_URL))) ||
  'http://localhost:5000';

console.log('API Base URL:', BASE_URL);

// Create axios instance with base URL
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Enable cookies for cross-origin requests
  timeout: 10000 // 10 second timeout
});

// Add request interceptor to include authentication token in headers
api.interceptors.request.use(
  (config) => {
    // Check if request is for admin endpoints
    const url = config.url || '';
    const isAdminRequest =
      url.startsWith('/admin') ||
      url.startsWith('/api/admin') ||
      // admin actions under /api that still require admin tokens
      /\/api\/groups\/[^/]+\/(approve|reject)/.test(url);
    
    // Get appropriate token based on request type
    const token = isAdminRequest 
      ? localStorage.getItem('adminToken') 
      : localStorage.getItem('token');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Network errors (server not running, etc.)
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - Is the backend server running?', error.message);
      // You could show a toast notification here
    }
    
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error.response.data);
      
      // Check if this is an admin request or if we're on admin pages
      const isAdminContext = error.config?.url?.startsWith('/admin') || 
                           window.location.pathname.startsWith('/admin');
      
      if (isAdminContext) {
        // Clear admin token and redirect to admin login
        localStorage.removeItem('adminToken');
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      } else {
        // Clear user token and redirect to user login
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    // Handle server errors
    if (error.response && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// API client
const apiClient = {
  get: async (url: string, config = {}): Promise<AxiosResponse> => {
    try {
      return await api.get(url, config);
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },

  post: async (url: string, data = {}, config = {}): Promise<AxiosResponse> => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  },

  put: async (url: string, data = {}, config = {}): Promise<AxiosResponse> => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  },
  
  delete: async (url: string, config = {}): Promise<AxiosResponse> => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  },

  // Add missing PATCH helper used across services
  patch: async (url: string, data = {}, config = {}): Promise<AxiosResponse> => {
    try {
      return await api.patch(url, data, config);
    } catch (error) {
      console.error(`PATCH ${url} failed:`, error);
      throw error;
    }
  }
};

export default apiClient; 