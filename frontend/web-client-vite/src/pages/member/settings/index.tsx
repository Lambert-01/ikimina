import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import ProfileSettings from '../../../components/settings/ProfileSettings';
import SecuritySettings from '../../../components/settings/SecuritySettings';
import MobileMoneySettings from '../../../components/settings/MobileMoneySettings';
import NotificationSettings from '../../../components/settings/NotificationSettings';
import LanguageCurrencySettings from '../../../components/settings/LanguageCurrencySettings';
import ComplianceSettings from '../../../components/settings/ComplianceSettings';
import { User, Shield, Smartphone, Bell, Globe, FileCheck } from 'lucide-react';

const EnhancedSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Profile</span>
            <span className="sm:hidden">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Security</span>
            <span className="sm:hidden">Security</span>
          </TabsTrigger>
          <TabsTrigger value="mobile-money" className="flex items-center">
            <Smartphone className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Mobile Money</span>
            <span className="sm:hidden">Money</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="language-currency" className="flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Language & Currency</span>
            <span className="sm:hidden">Lang/Curr</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center">
            <FileCheck className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Compliance</span>
            <span className="sm:hidden">Comply</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
        
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
        
        <TabsContent value="mobile-money">
          <MobileMoneySettings />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="language-currency">
          <LanguageCurrencySettings />
        </TabsContent>
        
        <TabsContent value="compliance">
          <ComplianceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSettingsPage; 