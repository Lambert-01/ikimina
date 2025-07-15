import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'member';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// Mock API calls for demonstration
const mockLogin = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  // In a real app, this would be an API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock user data
  return {
    user: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email,
      role: email.includes('manager') ? 'manager' : 'member',
    },
    token: 'mock-jwt-token',
  };
};

const mockRegister = async (userData: Partial<User> & { password: string }): Promise<{ user: User; token: string }> => {
  // In a real app, this would be an API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock user data
  return {
    user: {
      id: '2',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phone: userData.phone,
      role: 'member',
    },
    token: 'mock-jwt-token',
  };
};

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: async (email, password) => {
        try {
          const { user, token } = await mockLogin(email, password);
          set({ user, isAuthenticated: true, token });
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },

      register: async (userData) => {
        try {
          const { user, token } = await mockRegister(userData);
          set({ user, isAuthenticated: true, token });
        } catch (error) {
          console.error('Registration error:', error);
          throw error;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, token: null });
      },

      checkAuth: async () => {
        const { token } = get();
        
        // If we have a token, assume the user is authenticated
        // In a real app, you would validate the token with the server
        if (token) {
          // For demo purposes, we'll just keep the current user
            return;
          }

        // No token, user is not authenticated
        set({ user: null, isAuthenticated: false, token: null });
      },
    }),
    {
      name: 'ikimina-auth-storage',
    }
  )
);

export default useAuthStore; 