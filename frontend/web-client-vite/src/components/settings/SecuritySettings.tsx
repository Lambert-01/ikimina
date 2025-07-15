import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import { KeyRound, ShieldCheck, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface SecuritySettingsProps {
  onPasswordChange?: (oldPassword: string, newPassword: string) => Promise<void>;
  onTwoFactorToggle?: (enabled: boolean) => Promise<void>;
  className?: string;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  onPasswordChange,
  onTwoFactorToggle,
  className = '',
}) => {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [togglingTwoFactor, setTogglingTwoFactor] = useState(false);
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationCodeError, setVerificationCodeError] = useState('');

  // Password validation
  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(newPassword)) {
      errors.newPassword = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(newPassword)) {
      errors.newPassword = 'Password must contain at least one number';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setChangingPassword(true);
      
      if (onPasswordChange) {
        await onPasswordChange(currentPassword, newPassword);
      } else {
        // In a real app, this would call the API to change the password
        // For demo purposes, we'll simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      toast.success('Password changed successfully');
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle 2FA toggle
  const handleTwoFactorToggle = async () => {
    if (twoFactorEnabled) {
      // If 2FA is enabled, disable it directly
      try {
        setTogglingTwoFactor(true);
        
        if (onTwoFactorToggle) {
          await onTwoFactorToggle(false);
        } else {
          // In a real app, this would call the API to disable 2FA
          // For demo purposes, we'll simulate a delay
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        setTwoFactorEnabled(false);
        toast.success('Two-factor authentication disabled');
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        toast.error('Failed to disable two-factor authentication');
      } finally {
        setTogglingTwoFactor(false);
      }
    } else {
      // If 2FA is disabled, show verification code input
      setShowVerificationCode(true);
    }
  };

  // Handle verification code submission
  const handleVerificationCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setVerificationCodeError('Please enter the verification code');
      return;
    }
    
    try {
      setTogglingTwoFactor(true);
      
      // In a real app, this would validate the code and enable 2FA
      // For demo purposes, we'll just check if it's "123456"
      if (verificationCode !== '123456') {
        setVerificationCodeError('Invalid verification code');
        return;
      }
      
      if (onTwoFactorToggle) {
        await onTwoFactorToggle(true);
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setTwoFactorEnabled(true);
      setShowVerificationCode(false);
      setVerificationCode('');
      setVerificationCodeError('');
      toast.success('Two-factor authentication enabled');
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast.error('Failed to enable two-factor authentication');
    } finally {
      setTogglingTwoFactor(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Manage your password and account security
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Password Change Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  className={`block w-full rounded-md shadow-sm pr-10 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
              )}
            </div>
            
            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  className={`block w-full rounded-md shadow-sm pr-10 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordErrors.newPassword ? (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters and include uppercase, lowercase, and numbers.
                </p>
              )}
            </div>
            
            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`block w-full rounded-md shadow-sm pr-10 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={changingPassword}
              >
                {changingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </div>
        
        {/* Two-Factor Authentication Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication (2FA)</h3>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Protect your account</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Two-factor authentication adds an extra layer of security to your account.
                  In addition to your password, you'll need to enter a code from your phone.
                </p>
              </div>
            </div>
          </div>
          
          {showVerificationCode ? (
            <form onSubmit={handleVerificationCodeSubmit} className="space-y-4">
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code *
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    verificationCodeError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter code from SMS or authenticator app"
                />
                {verificationCodeError && (
                  <p className="mt-1 text-sm text-red-600">{verificationCodeError}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  For demo purposes, enter "123456" as the verification code.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={togglingTwoFactor}
                >
                  {togglingTwoFactor ? 'Verifying...' : 'Verify'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowVerificationCode(false);
                    setVerificationCode('');
                    setVerificationCodeError('');
                  }}
                  disabled={togglingTwoFactor}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {twoFactorEnabled 
                    ? 'Your account is protected with an additional layer of security.' 
                    : 'Enable two-factor authentication for enhanced security.'}
                </p>
              </div>
              <Button
                variant={twoFactorEnabled ? 'outline' : 'default'}
                onClick={handleTwoFactorToggle}
                disabled={togglingTwoFactor}
              >
                {togglingTwoFactor 
                  ? (twoFactorEnabled ? 'Disabling...' : 'Enabling...') 
                  : (twoFactorEnabled ? 'Disable' : 'Enable')}
              </Button>
            </div>
          )}
        </div>
        
        {/* Recent Activity Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Security Activity</h3>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 mt-1">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Password changed</p>
                <p className="text-xs text-gray-500">2 weeks ago • Kigali, Rwanda</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 mt-1">
                <ShieldCheck className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Login from new device</p>
                <p className="text-xs text-gray-500">1 month ago • Kigali, Rwanda</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 mt-1">
                <AlertTriangle className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Failed login attempt</p>
                <p className="text-xs text-gray-500">1 month ago • Unknown location</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings; 