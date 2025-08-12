import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { toast } from 'react-toastify';
import { Mail, Key, ArrowRight, Shield, Lock } from 'lucide-react';
import authService from '../../services/authService';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();

  // Check if admin is already logged in
  useEffect(() => {
    if (authService.isAdminLoggedIn()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    if (!password) {
      toast.error('Please enter your password');
      return;
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
    
      // Call admin login API using auth service
      const response = await authService.adminLogin({
        email,
        password
      });
      // authService.adminLogin already stores admin session in localStorage
      if (response?.success) {
        toast.success('Login successful!');
        navigate('/admin/dashboard');
      } else {
        toast.error(response?.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Invalid credentials. Please check your email and password.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have admin privileges.');
      } else {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-purple-600 flex items-center justify-center">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-dark-text">
            Admin Portal
        </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to access the administration dashboard
        </p>
          <Link to="/" className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-500">
            Return to main page
          </Link>
      </div>

        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-dark-border dark:bg-dark-background dark:text-dark-text rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-dark-border dark:bg-dark-background dark:text-dark-text rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-dark-border rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/admin/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-3 bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to Admin Portal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Admin access is restricted to authorized personnel only.</p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">MongoDB Admin Credentials:</p>
            <div className="space-y-1 text-sm">
              <p className="text-blue-700 dark:text-blue-300"><strong>Email:</strong> admin@ikimina.com</p>
              <p className="text-blue-700 dark:text-blue-300"><strong>Password:</strong> password123</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">This admin exists in your MongoDB database</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 