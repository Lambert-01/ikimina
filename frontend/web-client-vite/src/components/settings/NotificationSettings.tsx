import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import { Bell, Mail, Smartphone, Clock, Info } from 'lucide-react';

interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface NotificationType {
  id: string;
  name: string;
  description: string;
  channels: {
    channelId: string;
    enabled: boolean;
  }[];
}

interface NotificationSettingsProps {
  onSave?: (settings: NotificationType[]) => Promise<void>;
  className?: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onSave,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock notification channels
        const mockChannels: NotificationChannel[] = [
          {
            id: 'email',
            name: 'Email',
            description: 'Receive notifications via email',
            icon: <Mail className="h-5 w-5" />
          },
          {
            id: 'sms',
            name: 'SMS',
            description: 'Receive notifications via SMS',
            icon: <Smartphone className="h-5 w-5" />
          },
          {
            id: 'push',
            name: 'Push',
            description: 'Receive push notifications on your device',
            icon: <Bell className="h-5 w-5" />
          }
        ];
        
        // Mock notification types
        const mockNotificationTypes: NotificationType[] = [
          {
            id: 'contribution_reminder',
            name: 'Contribution Reminders',
            description: 'Notifications about upcoming and overdue contributions',
            channels: [
              { channelId: 'email', enabled: true },
              { channelId: 'sms', enabled: true },
              { channelId: 'push', enabled: true }
            ]
          },
          {
            id: 'loan_reminder',
            name: 'Loan Payment Reminders',
            description: 'Notifications about upcoming and overdue loan payments',
            channels: [
              { channelId: 'email', enabled: true },
              { channelId: 'sms', enabled: true },
              { channelId: 'push', enabled: true }
            ]
          },
          {
            id: 'group_activity',
            name: 'Group Activity',
            description: 'Updates about your savings groups',
            channels: [
              { channelId: 'email', enabled: true },
              { channelId: 'sms', enabled: false },
              { channelId: 'push', enabled: true }
            ]
          },
          {
            id: 'loan_status',
            name: 'Loan Status Updates',
            description: 'Updates about your loan applications and approvals',
            channels: [
              { channelId: 'email', enabled: true },
              { channelId: 'sms', enabled: true },
              { channelId: 'push', enabled: true }
            ]
          },
          {
            id: 'account_security',
            name: 'Account Security',
            description: 'Security alerts and notifications',
            channels: [
              { channelId: 'email', enabled: true },
              { channelId: 'sms', enabled: true },
              { channelId: 'push', enabled: false }
            ]
          },
          {
            id: 'marketing',
            name: 'Marketing & Promotions',
            description: 'News, updates, and promotional offers',
            channels: [
              { channelId: 'email', enabled: false },
              { channelId: 'sms', enabled: false },
              { channelId: 'push', enabled: false }
            ]
          }
        ];
        
        setChannels(mockChannels);
        setNotificationTypes(mockNotificationTypes);
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        toast.error('Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleToggleChannel = (typeId: string, channelId: string) => {
    setNotificationTypes(prevTypes => 
      prevTypes.map(type => {
        if (type.id === typeId) {
          return {
            ...type,
            channels: type.channels.map(channel => {
              if (channel.channelId === channelId) {
                return { ...channel, enabled: !channel.enabled };
              }
              return channel;
            })
          };
        }
        return type;
      })
    );
  };

  const handleToggleAllChannels = (typeId: string, enabled: boolean) => {
    setNotificationTypes(prevTypes => 
      prevTypes.map(type => {
        if (type.id === typeId) {
          return {
            ...type,
            channels: type.channels.map(channel => ({ ...channel, enabled }))
          };
        }
        return type;
      })
    );
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      if (onSave) {
        await onSave(notificationTypes);
      } else {
        // In a real app, this would call the API to save the settings
        // For demo purposes, we'll simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  // Check if any settings have been changed
  const isAnyChannelEnabled = notificationTypes.some(type => 
    type.channels.some(channel => channel.enabled)
  );

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading notification settings...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Manage how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Information Banner */}
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Choose how you'd like to be notified for different types of activities.
                Some notifications, like security alerts, cannot be disabled.
              </p>
            </div>
          </div>
        </div>
        
        {/* Notification Types */}
        <div className="space-y-6">
          {notificationTypes.map(type => (
            <div key={type.id} className="border rounded-md p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900">{type.name}</h3>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleAllChannels(type.id, true)}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleAllChannels(type.id, false)}
                  >
                    None
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {channels.map(channel => {
                  const channelSetting = type.channels.find(c => c.channelId === channel.id);
                  const isEnabled = channelSetting?.enabled || false;
                  
                  return (
                    <div 
                      key={`${type.id}-${channel.id}`}
                      className={`border rounded-md p-3 cursor-pointer transition-colors ${
                        isEnabled ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleToggleChannel(type.id, channel.id)}
                    >
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 ${isEnabled ? 'text-primary-600' : 'text-gray-400'}`}>
                          {channel.icon}
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm font-medium ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                            {channel.name}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <div className={`w-10 h-5 rounded-full p-0.5 ${isEnabled ? 'bg-primary-600' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white transform duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Notification Timing */}
        <div className="border-t pt-6">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Notification Timing</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="reminderDays" className="block text-sm font-medium text-gray-700 mb-1">
                Send contribution reminders
              </label>
              <select
                id="reminderDays"
                name="reminderDays"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                defaultValue="3"
              >
                <option value="1">1 day before due date</option>
                <option value="2">2 days before due date</option>
                <option value="3">3 days before due date</option>
                <option value="5">5 days before due date</option>
                <option value="7">1 week before due date</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="quietHours" className="block text-sm font-medium text-gray-700 mb-1">
                Quiet hours (no SMS or push notifications)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quietStart" className="block text-xs text-gray-500 mb-1">
                    Start time
                  </label>
                  <select
                    id="quietStart"
                    name="quietStart"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    defaultValue="22"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i-12}:00 PM`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="quietEnd" className="block text-xs text-gray-500 mb-1">
                    End time
                  </label>
                  <select
                    id="quietEnd"
                    name="quietEnd"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    defaultValue="7"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i-12}:00 PM`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSaveSettings}
            disabled={saving || !isAnyChannelEnabled}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings; 