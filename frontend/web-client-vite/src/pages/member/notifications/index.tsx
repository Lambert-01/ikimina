import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Filter, Trash, Settings } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Switch } from '../../../components/ui/switch';
import { Label } from '../../../components/ui/label';
import api from '../../../services/api';

// Mock notification types for demonstration
const NOTIFICATION_TYPES = [
  { id: 'contribution', name: 'Contributions', description: 'Notifications about contributions and payments' },
  { id: 'loan', name: 'Loans', description: 'Notifications about loan requests and approvals' },
  { id: 'meeting', name: 'Meetings', description: 'Notifications about upcoming meetings and events' },
  { id: 'group', name: 'Groups', description: 'Notifications about group activities and updates' },
  { id: 'system', name: 'System', description: 'System notifications and announcements' }
];

// Mock notification channels for demonstration
const NOTIFICATION_CHANNELS = [
  { id: 'app', name: 'In-App', description: 'Notifications within the application' },
  { id: 'email', name: 'Email', description: 'Notifications sent to your email address' },
  { id: 'sms', name: 'SMS', description: 'Notifications sent as text messages to your phone' }
];



interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionUrl: string | null;
}

interface NotificationPreference {
  type: string;
  channels: {
    app: boolean;
    email: boolean;
    sms: boolean;
  };
}

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  
  useEffect(() => {
    // Fetch real notifications from API
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        // Fetch notifications from backend
        const response = await api.get('/notifications/user');
        const notificationsData = response.data.success ? response.data.data : response.data;
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
        
        // Initialize preferences
        const initialPreferences = NOTIFICATION_TYPES.map(type => ({
          type: type.id,
          channels: {
            app: true,
            email: type.id === 'contribution' || type.id === 'loan',
            sms: type.id === 'contribution'
          }
        }));
        setPreferences(initialPreferences);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        // Set empty array on error to prevent crashes
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);
  
  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };
  
  const handleDeleteNotification = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };
  
  const handleClearAll = () => {
    setNotifications([]);
  };
  
  const handleTogglePreference = (typeId: string, channelId: string) => {
    setPreferences(prevPreferences => 
      prevPreferences.map(pref => 
        pref.type === typeId 
          ? { 
              ...pref, 
              channels: { 
                ...pref.channels, 
                [channelId]: !pref.channels[channelId as keyof typeof pref.channels] 
              } 
            } 
          : pref
      )
    );
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours === 0 
        ? 'Just now' 
        : `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">💰</div>;
      case 'loan':
        return <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">💸</div>;
      case 'meeting':
        return <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">📅</div>;
      case 'group':
        return <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">👥</div>;
      case 'system':
        return <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">⚙️</div>;
      default:
        return <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">📣</div>;
    }
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-500">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` 
              : 'No unread notifications'}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          {notifications.length > 0 && (
            <>
              <Button 
                variant="outline" 
                onClick={handleMarkAllAsRead}
                disabled={!notifications.some(n => !n.read)}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark All Read
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClearAll}
              >
                <Trash className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">
              All
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            {NOTIFICATION_TYPES.map(type => (
              <TabsTrigger key={type.id} value={type.id} className="hidden md:inline-flex">
                {type.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveTab('settings')}
            className="flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
        
        {/* All Notifications Tab */}
        <TabsContent value="all">
          {renderNotificationsList(filteredNotifications)}
        </TabsContent>
        
        {/* Unread Tab */}
        <TabsContent value="unread">
          {renderNotificationsList(filteredNotifications)}
        </TabsContent>
        
        {/* Type-specific Tabs */}
        {NOTIFICATION_TYPES.map(type => (
          <TabsContent key={type.id} value={type.id}>
            {renderNotificationsList(filteredNotifications)}
          </TabsContent>
        ))}
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-6">
                Choose how you want to receive notifications. You can enable or disable notifications for each channel.
              </p>
              
              <div className="space-y-6">
                {NOTIFICATION_TYPES.map(type => (
                  <div key={type.id} className="border-b pb-4 last:border-0">
                    <h3 className="font-medium mb-1">{type.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{type.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {NOTIFICATION_CHANNELS.map(channel => {
                        const pref = preferences.find(p => p.type === type.id);
                        const isEnabled = pref ? pref.channels[channel.id as keyof typeof pref.channels] : false;
                        
                        return (
                          <div key={channel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <Label htmlFor={`${type.id}-${channel.id}`} className="font-medium">
                                {channel.name}
                              </Label>
                              <p className="text-xs text-gray-500">{channel.description}</p>
                            </div>
                            <Switch 
                              id={`${type.id}-${channel.id}`}
                              checked={isEnabled}
                              onCheckedChange={() => handleTogglePreference(type.id, channel.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
  
  function renderNotificationsList(notifications: Notification[]) {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      );
    }
    
    if (notifications.length === 0) {
      return (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No notifications</h3>
          <p className="text-gray-500">You don't have any notifications in this category</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`p-4 rounded-lg border ${notification.read ? 'bg-white' : 'bg-blue-50 border-blue-100'}`}
          >
            <div className="flex">
              <div className="mr-4 flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-medium ${notification.read ? 'text-gray-900' : 'text-blue-900'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-500">{formatDate(notification.date)}</span>
                </div>
                <p className={`text-sm mt-1 ${notification.read ? 'text-gray-600' : 'text-blue-800'}`}>
                  {notification.message}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  {notification.actionUrl && (
                    <a 
                      href={notification.actionUrl} 
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      View Details
                    </a>
                  )}
                  <div className="flex space-x-2">
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default NotificationsPage; 