import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, Phone, Mail, Key, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import useAuthStore from '../../store/authStore';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, error, clearError, isAuthenticated } = useAuthStore();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('RegisterForm: User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any existing errors
    clearError();
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields including email');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    // Validate phone number format
    if (!formData.phoneNumber.startsWith('+250')) {
      toast.error('Please enter a valid Rwandan phone number starting with +250');
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('RegisterForm: Attempting registration...');
      
      // Register user
      const success = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password,
        language: 'en'
      });
      
      console.log('RegisterForm: Registration result:', success);
        
      if (success) {
        toast.success('Registration successful! Welcome to Ikimina.');
        console.log('RegisterForm: Navigating to dashboard...');
        // Use replace to prevent going back to registration page
        navigate('/dashboard', { replace: true });
      } else {
        // Error is already set in the auth store, just show a generic message
        const authError = useAuthStore.getState().error;
        toast.error(authError || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error('RegisterForm: Registration error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">IK</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
                    id="firstName"
                    name="firstName"
              type="text"
                    required
                    autoComplete="given-name"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="John"
              value={formData.firstName}
                    onChange={handleChange}
            />
          </div>
        </div>
        
        <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Name *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
                    id="lastName"
                    name="lastName"
              type="text"
                    required
                    autoComplete="family-name"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Doe"
              value={formData.lastName}
                    onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Phone Number *
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
                  id="phoneNumber"
                  name="phoneNumber"
            type="tel"
                  required
                  autoComplete="tel"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="+250781234567"
            value={formData.phoneNumber}
                  onChange={handleChange}
          />
              </div>
            </div>

      <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
                  id="email"
                  name="email"
            type="email"
                  required
                  autoComplete="email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="john.doe@example.com"
            value={formData.email}
                  onChange={handleChange}
          />
      </div>
    </div>

      <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password *
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
          </div>
          <input
                  id="password"
                  name="password"
            type="password"
                  required
                  autoComplete="new-password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="••••••••"
            value={formData.password}
                  onChange={handleChange}
          />
        </div>
      </div>

      <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm Password *
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
          </div>
          <input
                  id="confirmPassword"
                  name="confirmPassword"
            type="password"
                  required
                  autoComplete="new-password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="••••••••"
            value={formData.confirmPassword}
                  onChange={handleChange}
                  />
              </div>
            </div>
            
                        {/* Error Message Display */}
            {error && (
              <div className="mb-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-3"
                  disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
                </Button>
            </div>
          </form>
        </div>
        
        <div className="text-center">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300">
            ← Back to home
          </Link>
        </div>
        
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="font-medium text-purple-800 dark:text-purple-200 mb-2">Registration Guidelines:</p>
            <div className="space-y-1 text-sm">
              <p className="text-purple-700 dark:text-purple-300">• Use a valid Rwandan phone number (+250...)</p>
              <p className="text-purple-700 dark:text-purple-300">• Password must be at least 6 characters</p>
              <p className="text-purple-700 dark:text-purple-300">• Email is required for account verification</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">Your account will be created in MongoDB database</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 