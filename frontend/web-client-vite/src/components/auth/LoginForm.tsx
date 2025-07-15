import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Mail, Smartphone, Key, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';

interface LoginFormProps {
  onLogin?: (role: 'member' | 'manager') => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const validatePhoneNumber = (phone: string) => {
    // Basic validation for Rwandan phone numbers
    const rwandaPhoneRegex = /^(\+250|0)?(7[2389]|9[0-9])[0-9]{7}$/;
    return rwandaPhoneRegex.test(phone);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email && !phoneNumber) {
      toast.error('Please enter your email or phone number');
      return;
    }
    
    if (!password) {
      toast.error('Please enter your password');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, this would call an API
      // For demo purposes, we'll simulate a successful login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Determine role based on email (for demo purposes)
      const role = email.includes('manager') ? 'manager' : 'member';
      
      // Use the provided onLogin prop if available, otherwise use the store login
      if (onLogin) {
        onLogin(role);
      } else {
        await login(email || phoneNumber, password);
      }
      
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid Rwandan phone number');
      return;
    }
    
    try {
      setOtpLoading(true);
      
      // In a real app, this would call an API to send OTP
      // For demo purposes, we'll simulate sending an OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsOtpSent(true);
      toast.success('OTP sent to your phone');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode) {
      toast.error('Please enter the OTP code');
      return;
    }
    
    if (otpCode.length < 4) {
      toast.error('Please enter a valid OTP code');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, this would verify the OTP with an API
      // For demo purposes, we'll simulate a successful verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Determine role (for demo purposes)
      const role = 'member';
      
      // Use the provided onLogin prop if available, otherwise use the store login
      if (onLogin) {
        onLogin(role);
      } else {
        await login(phoneNumber, 'otp-auth');
      }
      
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-xl font-bold text-white">IK</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'password' | 'otp')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="password" className="text-center py-3">
              <Key className="h-4 w-4 mr-2" />
              Password
            </TabsTrigger>
            <TabsTrigger value="otp" className="text-center py-3">
              <Smartphone className="h-4 w-4 mr-2" />
              SMS Code
            </TabsTrigger>
          </TabsList>
          
          {/* Password Login */}
          <TabsContent value="password">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <form className="space-y-6" onSubmit={handlePasswordLogin}>
                <div>
                  <label htmlFor="email-phone" className="block text-sm font-medium text-gray-700">
                    Email or Phone Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {email.includes('@') ? (
                        <Mail className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Smartphone className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <input
                      id="email-phone"
                      name="email-phone"
                      type="text"
                      autoComplete="email"
                      placeholder="Email or +250..."
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={email || phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.includes('@')) {
                          setEmail(value);
                          setPhoneNumber('');
                        } else {
                          setPhoneNumber(value);
                          setEmail('');
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full flex justify-center items-center py-3 px-4 bg-primary-600 hover:bg-primary-700"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : (
                      <>
                        Sign in
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
          
          {/* OTP Login */}
          <TabsContent value="otp">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              {!isOtpSent ? (
                <form className="space-y-6" onSubmit={handleRequestOtp}>
                  <div>
                    <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Smartphone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone-number"
                        name="phone-number"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+250..."
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      We'll send a verification code to this number
                    </p>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full flex justify-center items-center py-3 px-4 bg-primary-600 hover:bg-primary-700"
                      disabled={otpLoading}
                    >
                      {otpLoading ? 'Sending code...' : 'Send verification code'}
                    </Button>
                  </div>
                </form>
              ) : (
                <form className="space-y-6" onSubmit={handleOtpLogin}>
                  <div>
                    <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700">
                      Verification Code
                    </label>
                    <input
                      id="otp-code"
                      name="otp-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center text-2xl letter-spacing-wide"
                      placeholder="••••"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setOtpCode(value);
                      }}
                    />
                    <p className="mt-2 text-sm text-gray-500 text-center">
                      Enter the 6-digit code sent to {phoneNumber}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="text-sm font-medium text-primary-600 hover:text-primary-500"
                      onClick={() => setIsOtpSent(false)}
                    >
                      Change phone number
                    </button>
                    
                    <button
                      type="button"
                      className="text-sm font-medium text-primary-600 hover:text-primary-500"
                      onClick={handleRequestOtp}
                      disabled={otpLoading}
                    >
                      {otpLoading ? 'Sending...' : 'Resend code'}
                    </button>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full flex justify-center items-center py-3 px-4 bg-primary-600 hover:bg-primary-700"
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : (
                        <>
                          Verify and sign in
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M16.6,14c-0.2-0.1-1.5-0.7-1.7-0.8c-0.2-0.1-0.4-0.1-0.6,0.1c-0.2,0.2-0.6,0.8-0.8,1c-0.1,0.2-0.3,0.2-0.5,0.1c-0.7-0.3-1.4-0.7-2-1.2c-0.5-0.5-1-1.1-1.4-1.7c-0.1-0.2,0-0.4,0.1-0.5c0.1-0.1,0.2-0.3,0.4-0.4c0.1-0.1,0.2-0.3,0.2-0.4c0.1-0.1,0.1-0.3,0-0.4c-0.1-0.1-0.6-1.3-0.8-1.8C9.4,7.3,9.2,7.3,9,7.3c-0.1,0-0.3,0-0.5,0C8.3,7.3,8,7.5,7.9,7.6C7.3,8.2,7,8.9,7,9.7c0.1,0.9,0.4,1.8,1,2.6c1.1,1.6,2.5,2.9,4.2,3.7c0.5,0.2,0.9,0.4,1.4,0.5c0.5,0.2,1,0.2,1.6,0.1c0.7-0.1,1.3-0.6,1.7-1.2c0.2-0.4,0.2-0.8,0.1-1.2C17,14.2,16.8,14.1,16.6,14 M19.1,4.9C15.2,1,8.9,1,5,4.9c-3.2,3.2-3.8,8.1-1.6,12L2,22l5.3-1.4c1.5,0.8,3.1,1.2,4.7,1.2h0c5.5,0,9.9-4.4,9.9-9.9C22,9.3,20.9,6.8,19.1,4.9 M16.4,18.9c-1.3,0.8-2.8,1.3-4.4,1.3h0c-1.5,0-2.9-0.4-4.2-1.1l-0.3-0.2l-3.1,0.8l0.8-3l-0.2-0.3C2.6,12.4,3.8,7.4,7.7,4.9S16.6,3.7,19,7.5C21.4,11.4,20.3,16.5,16.4,18.9"
                />
              </svg>
              Mobile Money
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 