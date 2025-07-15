import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Lock, 
  Save,
  Trash2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { toast } from 'react-toastify';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'mobile_money' | 'bank' | 'card';
  name: string;
  details: string;
  isDefault: boolean;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [groupName, setGroupName] = useState('Kigali Savings Group');
  const [groupDescription, setGroupDescription] = useState('A community savings group for residents of Kigali to help each other achieve financial goals.');
  const [contributionAmount, setContributionAmount] = useState(10000);
  const [contributionFrequency, setContributionFrequency] = useState('weekly');
  const [maxMembers, setMaxMembers] = useState(20);
  const [currency, setCurrency] = useState('RWF');
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'contribution_reminder',
      name: 'Contribution Reminders',
      description: 'Notifications about upcoming and overdue contributions',
      email: true,
      sms: true,
      push: true
    },
    {
      id: 'loan_updates',
      name: 'Loan Updates',
      description: 'Updates on loan requests, approvals, and repayments',
      email: true,
      sms: false,
      push: true
    },
    {
      id: 'meeting_reminders',
      name: 'Meeting Reminders',
      description: 'Reminders about upcoming group meetings',
      email: true,
      sms: true,
      push: true
    },
    {
      id: 'group_announcements',
      name: 'Group Announcements',
      description: 'Important announcements and updates from group administrators',
      email: true,
      sms: false,
      push: true
    }
  ]);
  
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([
    {
      id: 'two_factor_auth',
      name: 'Two-Factor Authentication',
      description: 'Require a verification code in addition to password when signing in',
      enabled: true
    },
    {
      id: 'login_alerts',
      name: 'Login Alerts',
      description: 'Receive notifications when your account is accessed from a new device',
      enabled: true
    },
    {
      id: 'require_approval',
      name: 'Require Admin Approval for Large Transactions',
      description: 'Transactions above 50,000 RWF require admin approval',
      enabled: true
    },
    {
      id: 'session_timeout',
      name: 'Session Timeout',
      description: 'Automatically log out after 30 minutes of inactivity',
      enabled: false
    }
  ]);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'mobile_money',
      name: 'MTN Mobile Money',
      details: '+250 78 123 4567',
      isDefault: true
    },
    {
      id: '2',
      type: 'bank',
      name: 'Bank of Kigali',
      details: 'Account ending in 5678',
      isDefault: false
    }
  ]);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  const handleNotificationToggle = (id: string, channel: 'email' | 'sms' | 'push') => {
    setNotificationSettings(notificationSettings.map(setting => 
      setting.id === id 
        ? { ...setting, [channel]: !setting[channel] }
        : setting
    ));
  };
  
  const handleSecurityToggle = (id: string) => {
    setSecuritySettings(securitySettings.map(setting => 
      setting.id === id 
        ? { ...setting, enabled: !setting.enabled }
        : setting
    ));
  };
  
  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(method => 
      ({ ...method, isDefault: method.id === id })
    ));
  };
  
  const handleRemovePayment = (id: string) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    toast.success('Payment method removed');
  };
  
  const handleSaveGeneralSettings = () => {
    toast.success('General settings saved successfully');
  };
  
  const handleSaveNotificationSettings = () => {
    toast.success('Notification preferences updated');
  };
  
  const handleSaveSecuritySettings = () => {
    toast.success('Security settings updated');
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'mobile_money':
        return <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">MM</div>;
      case 'bank':
        return <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">BK</div>;
      case 'card':
        return <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">CC</div>;
      default:
        return <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">$</div>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your group settings and preferences</p>
      </div>
      
      {/* Settings Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('general')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              General
            </div>
          </button>
          <button
            onClick={() => handleTabChange('notifications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </div>
          </button>
          <button
            onClick={() => handleTabChange('security')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </div>
          </button>
          <button
            onClick={() => handleTabChange('payment')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payment'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Methods
            </div>
          </button>
        </nav>
      </div>
      
      {/* General Settings */}
      {activeTab === 'general' && (
        <Card className="p-6 border border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Group Information</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  id="groupName"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Members
                </label>
                <input
                  type="number"
                  id="maxMembers"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(Number(e.target.value))}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Group Description
              </label>
              <textarea
                id="groupDescription"
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
              ></textarea>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-medium text-gray-800 mb-4">Contribution Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contributionAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Contribution Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">RWF</span>
                    </div>
                    <input
                      type="number"
                      id="contributionAmount"
                      className="w-full border border-gray-300 rounded-md pl-12 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="contributionFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                    Contribution Frequency
                  </label>
                  <select
                    id="contributionFrequency"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={contributionFrequency}
                    onChange={(e) => setContributionFrequency(e.target.value)}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-medium text-gray-800 mb-4">Regional Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    id="currency"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="RWF">Rwandan Franc (RWF)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    defaultValue="Africa/Kigali"
                  >
                    <option value="Africa/Kigali">Kigali (GMT+2)</option>
                    <option value="Africa/Nairobi">Nairobi (GMT+3)</option>
                    <option value="Africa/Lagos">Lagos (GMT+1)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button className="flex items-center" onClick={handleSaveGeneralSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <Card className="p-6 border border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h2>
          
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notification Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SMS
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Push
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notificationSettings.map((setting) => (
                    <tr key={setting.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{setting.name}</div>
                        <div className="text-sm text-gray-500">{setting.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={setting.email}
                            onChange={() => handleNotificationToggle(setting.id, 'email')}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={setting.sms}
                            onChange={() => handleNotificationToggle(setting.id, 'sms')}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={setting.push}
                            onChange={() => handleNotificationToggle(setting.id, 'push')}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-medium text-gray-800 mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    defaultValue="admin@kigalisavings.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    defaultValue="+250 78 123 4567"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button className="flex items-center" onClick={handleSaveNotificationSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Security Settings */}
      {activeTab === 'security' && (
        <Card className="p-6 border border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h2>
          
          <div className="space-y-6">
            <div className="space-y-4">
              {securitySettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-md font-medium text-gray-900">{setting.name}</h3>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex relative items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={setting.enabled}
                        onChange={() => handleSecurityToggle(setting.id)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-medium text-gray-800 mb-4">Password</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="mt-4 flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Password must be at least 8 characters long</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button className="flex items-center" onClick={handleSaveSecuritySettings}>
                <Lock className="h-4 w-4 mr-2" />
                Update Security Settings
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Payment Methods */}
      {activeTab === 'payment' && (
        <Card className="p-6 border border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h2>
          
          <div className="space-y-6">
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    {getPaymentMethodIcon(method.type)}
                    <div className="ml-4">
                      <h3 className="text-md font-medium text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-500">{method.details}</p>
                    </div>
                    {method.isDefault && (
                      <span className="ml-3 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {!method.isDefault && (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefaultPayment(method.id)}>
                        Set as Default
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:border-red-700" onClick={() => handleRemovePayment(method.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-medium text-gray-800 mb-4">Add New Payment Method</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type
                  </label>
                  <select
                    id="paymentType"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    defaultValue="mobile_money"
                  >
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank">Bank Account</option>
                    <option value="card">Credit/Debit Card</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="paymentName" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="paymentName"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., MTN Mobile Money"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label htmlFor="paymentDetails" className="block text-sm font-medium text-gray-700 mb-1">
                  Details
                </label>
                <input
                  type="text"
                  id="paymentDetails"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., +250 78 123 4567"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button>
                Add Payment Method
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage; 