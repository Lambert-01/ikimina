import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Smartphone, 
  Lock, 
  Upload, 
  Info, 
  CheckCircle, 
  ArrowRight, 
  AlertCircle,
  HelpCircle,
  Check,
  ChevronLeft,
  Users
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const navigate = useNavigate();

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    nationalId: null as File | null,
    role: 'member' as 'member' | 'manager',
    createGroup: false,
    agreeToTerms: false
  });

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePhoneNumber = (phone: string) => {
    // Basic validation for Rwandan phone numbers
    const rwandaPhoneRegex = /^(\+250|0)?(7[2389]|9[0-9])[0-9]{7}$/;
    return rwandaPhoneRegex.test(phone);
  };

  const validateEmail = (email: string) => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email === '' || emailRegex.test(email); // Email is optional
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid Rwandan phone number';
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      // If phone is verified, proceed to next step
      if (isVerified) {
        setCurrentStep(2);
      } else {
        // Otherwise, send verification code
        handleSendVerificationCode();
      }
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSendVerificationCode = async () => {
    try {
      setVerifying(true);
      
      // In a real app, this would call an API to send OTP
      // For demo purposes, we'll simulate sending an OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Verification code sent to your phone');
      setOtpCode('');
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast.error('Failed to send verification code');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) {
      toast.error('Please enter a valid verification code');
      return;
    }
    
    try {
      setVerifying(true);
      
      // In a real app, this would verify the OTP with an API
      // For demo purposes, we'll simulate a successful verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsVerified(true);
      toast.success('Phone number verified successfully');
      setCurrentStep(2);
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error('Failed to verify code');
    } finally {
      setVerifying(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, nationalId: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, this would call an API
      // For demo purposes, we'll simulate a successful registration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Registration successful! Please check your phone for verification.');
      
      // Redirect to onboarding or login
      setTimeout(() => {
        navigate('/onboarding');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name *
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="fullName"
            className={`block w-full pl-10 pr-3 py-3 border ${
              errors.fullName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>
        {errors.fullName && (
          <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
        )}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
          Phone Number *
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Smartphone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            id="phoneNumber"
            className={`block w-full pl-10 pr-3 py-3 border ${
              errors.phoneNumber ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
            placeholder="+250..."
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            disabled={isVerified}
          />
          {isVerified && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
        {errors.phoneNumber ? (
          <p className="mt-2 text-sm text-red-600">{errors.phoneNumber}</p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">We'll send a verification code to this number</p>
        )}
      </div>

      {!isVerified && otpCode !== undefined && (
        <div className="space-y-4 bg-gray-50 p-4 rounded-md">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
            <p className="text-sm text-gray-700">
              Enter the 6-digit verification code sent to your phone
            </p>
          </div>
          
          <div className="flex space-x-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center text-lg tracking-widest"
              placeholder="••••••"
              value={otpCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setOtpCode(value);
              }}
            />
            <Button
              type="button"
              onClick={handleVerifyOtp}
              disabled={verifying || otpCode.length < 4}
              className="whitespace-nowrap"
            >
              {verifying ? 'Verifying...' : 'Verify Code'}
            </Button>
          </div>
          
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-primary-600 hover:text-primary-500"
              onClick={handleSendVerificationCode}
              disabled={verifying}
            >
              {verifying ? 'Sending...' : 'Resend code'}
            </button>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address (Optional)
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            className={`block w-full pl-10 pr-3 py-3 border ${
              errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        {errors.email ? (
          <p className="mt-2 text-sm text-red-600">{errors.email}</p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">For account recovery and notifications</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Create Password *
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            id="password"
            className={`block w-full pl-10 pr-3 py-3 border ${
              errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        {errors.password ? (
          <p className="mt-2 text-sm text-red-600">{errors.password}</p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">Must be at least 8 characters</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password *
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            id="confirmPassword"
            className={`block w-full pl-10 pr-3 py-3 border ${
              errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700">
          National ID or Passport (Optional)
        </label>
        <div className="mt-1">
          <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="nationalId"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="nationalId"
                    name="nationalId"
                    type="file"
                    className="sr-only"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF up to 10MB
              </p>
            </div>
          </div>
          {formData.nationalId && (
            <p className="mt-2 text-sm text-green-600">
              File selected: {formData.nationalId.name}
            </p>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500 flex items-center">
          <HelpCircle className="h-4 w-4 mr-1 text-gray-400" />
          This helps verify your identity for security purposes
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Choose Your Role</h3>
        <p className="text-sm text-gray-500 mt-1">
          Select how you want to use Ikimina
        </p>
        
        <div className="mt-4 space-y-4">
          <Tabs defaultValue={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'member' | 'manager' })}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="member">Join as a Member</TabsTrigger>
              <TabsTrigger value="manager">Create a Group</TabsTrigger>
            </TabsList>
            <TabsContent value="member" className="p-4 bg-gray-50 rounded-md mt-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-primary-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Join as a Member</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Join existing savings groups, make contributions, and apply for loans
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="manager" className="p-4 bg-gray-50 rounded-md mt-4">
              <div className="flex items-start">
                <Users className="h-5 w-5 text-primary-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Create a Group</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Start your own savings group and manage members, contributions, and loans
                  </p>
                  <div className="mt-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        checked={formData.createGroup}
                        onChange={(e) => setFormData({ ...formData, createGroup: e.target.checked })}
                      />
                      <span className="ml-2 text-sm text-gray-700">I want to create a new group now</span>
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
              I agree to the terms and conditions
            </label>
            <p className="text-gray-500">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
              .
            </p>
            {errors.agreeToTerms && (
              <p className="mt-2 text-sm text-red-600">{errors.agreeToTerms}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-xl font-bold text-white">IK</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step === currentStep 
                        ? 'bg-primary-600 text-white' 
                        : step < currentStep 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step < currentStep ? <Check size={16} /> : step}
                  </div>
                  <span className="text-xs mt-1 text-gray-500">
                    {step === 1 ? 'Profile' : step === 2 ? 'Security' : 'Role'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-2">
              <div className={`h-1 ${currentStep > 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              <div className={`h-1 ${currentStep > 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            
            <div className="mt-8 flex justify-between">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={loading || (currentStep === 1 && !isVerified && otpCode === undefined)}
                >
                  {currentStep === 1 && !isVerified && otpCode === undefined ? 'Verify Phone' : 'Continue'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 