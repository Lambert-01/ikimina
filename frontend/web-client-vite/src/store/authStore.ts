import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import authService from '../services/authService';

interface AuthState {
  token: string | null;
  user: {
  id: string;
  firstName: string;
  lastName: string;
    phoneNumber: string;
  email?: string;
    roles: string[];
    primaryRole: 'member' | 'manager' | 'admin' | 'user';
    memberOfGroups: any[];
    managerOfGroups: any[];
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  checkAuth: () => Promise<void>;
  login: (phoneNumber: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const useAuthStore = create<AuthState>()(
  devtools(
  persist(
    (set, get) => ({
        token: null,
      user: null,
      isAuthenticated: false,
        isLoading: false,
        error: null,
        
        // Check if user is authenticated
        checkAuth: async () => {
          try {
            // First check token
            const token = authService.getToken();
            
            if (!token) {
              set({ 
                isAuthenticated: false,
                user: null
              });
              return;
            }
            
            // Try to get current user data
            set({ isLoading: true });
            
            try {
              const response = await authService.getMe();
              
              if (response && response.success && response.data) {
                // Determine primary role
                const roles = response.data.roles || ['member'];
                const primaryRole = roles.includes('admin') ? 'admin' : 
                                   roles.includes('manager') ? 'manager' : 
                                   roles.includes('user') ? 'user' : 'member';
                
                set({
                  user: {
                    ...response.data,
                    roles,
                    primaryRole
                  },
                  isAuthenticated: true
                });
            } else {
                // Clear auth state if API call fails
                set({
                  token: null,
                  user: null,
                  isAuthenticated: false,
                  error: response?.message || 'Authentication failed'
                });
                
                // Clear token from storage
                authService.logout();
              }
            } catch (error) {
              console.error('Failed to get user data:', error);
              
              // In development mode, provide mock user if backend is not available
              if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_USER === 'true') {
                console.log('Development mode: Using mock user data');
          
          set({ 
                  user: {
                    id: 'dev-user-123',
                    firstName: 'Dev',
                    lastName: 'User',
                    phoneNumber: '+250781234567',
                    email: 'dev@ikimina.com',
                    roles: ['member', 'manager', 'admin', 'user'],
                    primaryRole: 'admin',
                    memberOfGroups: [],
                    managerOfGroups: []
                  },
                  isAuthenticated: true
                });
              } else {
                // Clear auth state if API call fails
                set({
                  token: null,
                  user: null,
                  isAuthenticated: false,
                  error: 'Failed to get user data'
                });
                
                // Clear token from storage
                authService.logout();
              }
            }
            
            set({ isLoading: false });
          } catch (error) {
            console.error('Auth check error:', error);
          
          set({ 
              token: null,
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Authentication check failed'
            });
            
            // Clear token from storage
            authService.logout();
          }
        },
        
        // Login
        login: async (phoneNumber: string, password: string) => {
          try {
            set({ isLoading: true, error: null });
            
            console.log('AuthStore: Attempting login for:', phoneNumber);
            
            const response = await authService.login({
              phoneNumber,
              password
            });
            
            console.log('AuthStore: Login response:', response);
            
            if (response && response.success && response.data) {
              const userData = response.data;
              
              // Extract user data - handle both user object and flattened structure
              const user = userData.user || userData;
              
              const userState = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                email: user.email,
                roles: user.roles || ['member'],
                primaryRole: user.primaryRole || 'member',
                memberOfGroups: user.memberOfGroups || [],
                managerOfGroups: user.managerOfGroups || []
              };
              
              console.log('AuthStore: Setting user state:', userState);
              
              set({ 
                token: userData.token,
                user: userState,
                isAuthenticated: true,
                error: null
              });
              
              return true;
            } else {
              const errorMessage = response?.message || 'Login failed - invalid credentials';
              console.error('AuthStore: Login failed:', errorMessage);
              
              set({ 
                error: errorMessage,
                isAuthenticated: false,
                user: null,
                token: null
              });
              return false;
            }
          } catch (error: any) {
            console.error('AuthStore: Login error:', error);
            
            let errorMessage = 'Login failed';
            
            if (error?.response?.status === 401) {
              errorMessage = 'Invalid phone number or password';
            } else if (error?.response?.status === 400) {
              errorMessage = error?.response?.data?.message || 'Please check your input';
            } else if (error?.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            
            set({ 
              error: errorMessage,
              isAuthenticated: false,
              user: null,
              token: null
            });
            return false;
          } finally {
            set({ isLoading: false });
          }
        },
        
        // Register
        register: async (userData: any) => {
          try {
            set({ isLoading: true, error: null });
            
            console.log('AuthStore: Attempting registration for:', userData.phoneNumber);
            
            const response = await authService.register(userData);
            
            console.log('AuthStore: Registration response:', response);
            
            if (response && response.success && response.data) {
              const responseData = response.data;
              
              // Extract user data - handle both user object and flattened structure
              const user = responseData.user || responseData;
              
              const userState = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                email: user.email,
                roles: user.roles || ['member'],
                primaryRole: user.primaryRole || 'member',
                memberOfGroups: user.memberOfGroups || [],
                managerOfGroups: user.managerOfGroups || []
              };
              
              console.log('AuthStore: Setting registered user state:', userState);
              
              set({ 
                token: responseData.token,
                user: userState,
                isAuthenticated: true,
                error: null
              });
              
              return true;
            } else {
              const errorMessage = response?.message || 'Registration failed';
              console.error('AuthStore: Registration failed:', errorMessage);
              
              set({ 
                error: errorMessage,
                isAuthenticated: false,
                user: null,
                token: null
              });
              return false;
            }
          } catch (error: any) {
            console.error('AuthStore: Registration error:', error);
            
            let errorMessage = 'Registration failed';
            
            if (error?.response?.status === 400) {
              errorMessage = error?.response?.data?.message || 'Please check your input';
            } else if (error?.response?.status === 409) {
              errorMessage = error?.response?.data?.message || 'Phone number or email already exists';
            } else if (error?.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            
            set({ 
              error: errorMessage,
              isAuthenticated: false,
              user: null,
              token: null
            });
            return false;
          } finally {
            set({ isLoading: false });
          }
        },
        
        // Logout
        logout: () => {
          authService.logout();
          
          set({
            token: null,
            user: null,
            isAuthenticated: false
          });
        },
        
        // Clear error
        clearError: () => set({ error: null }),
        
        // Check if user has a specific role
        hasRole: (role: string) => {
          const user = get().user;
          if (!user) return false;
          return user.roles.includes(role);
        },
        
        // Check if user has any of the specified roles
        hasAnyRole: (roles: string[]) => {
          const user = get().user;
          if (!user) return false;
          return user.roles.some(role => roles.includes(role));
        }
      }),
      {
        name: 'auth-store',
        skipHydration: false,
      }
    )
  )
);

export default useAuthStore; 