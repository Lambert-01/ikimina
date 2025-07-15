import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Search,
  Trash2,
  MailOpen,
  MessageSquare,
  Settings,
  AlertCircle,
  Info,
  CheckCheck
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { toast } from 'react-toastify';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'system' | 'payment' | 'meeting' | 'loan' | 'group';
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
}

const NotificationsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock notifications data
      setNotifications([
        {
          id: '1',
          title: 'Payment Due Reminder',
          message: 'Your weekly contribution of RWF 10,000 is due tomorrow for Kigali Savings Group.',
          date: '2023-06-09T10:30:00',
          type: 'payment',
          priority: 'high',
          isRead: false
        },
        {
          id: '2',
          title: 'Upcoming Meeting',
          message: 'Monthly group meeting scheduled for Saturday, June 10th at 2:00 PM at Kigali Community Center.',
          date: '2023-06-08T09:15:00',
          type: 'meeting',
          priority: 'medium',
          isRead: false
        },
        {
          id: '3',
          title: 'Loan Approved',
          message: 'Your loan request for RWF 50,000 has been approved by the group administrator.',
          date: '2023-06-05T14:20:00',
          type: 'loan',
          priority: 'high',
          isRead: true
        },
        {
          id: '4',
          title: 'New Group Rule',
          message: 'A new rule has been added: Members must attend at least 75% of meetings to maintain good standing.',
          date: '2023-06-02T11:45:00',
          type: 'group',
          priority: 'medium',
          isRead: true
        },
        {
          id: '5',
          title: 'System Maintenance',
          message: 'The platform will be undergoing maintenance on Sunday, June 11th from 2:00 AM to 4:00 AM.',
          date: '2023-06-01T08:30:00',
          type: 'system',
          priority: 'low',
          isRead: true
        },
        {
          id: '6',
          title: 'Payment Confirmation',
          message: 'Your contribution of RWF 10,000 has been received for Kigali Savings Group.',
          date: '2023-05-30T16:10:00',
          type: 'payment',
          priority: 'low',
          isRead: true
        },
        {
          id: '7',
          title: 'New Member Joined',
          message: 'Welcome Alice Uwimana to Kigali Savings Group! Say hello at the next meeting.',
          date: '2023-05-28T13:25:00',
          type: 'group',
          priority: 'low',
          isRead: true
        }
      ]);
      
    } catch (error) {
      console.error('Notifications fetch error:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSelectNotification = (id: string) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(notificationId => notificationId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(notification => notification.id));
    }
    setSelectAll(!selectAll);
  };
  
  const handleMarkAsRead = () => {
    if (selectedNotifications.length === 0) return;
    
    setNotifications(notifications.map(notification => 
      selectedNotifications.includes(notification.id) 
        ? { ...notification, isRead: true }
        : notification
    ));
    
    toast.success(`Marked ${selectedNotifications.length} notification(s) as read`);
    setSelectedNotifications([]);
    setSelectAll(false);
  };
  
  const handleDeleteSelected = () => {
    if (selectedNotifications.length === 0) return;
    
    setNotifications(notifications.filter(notification => 
      !selectedNotifications.includes(notification.id)
    ));
    
    toast.success(`Deleted ${selectedNotifications.length} notification(s)`);
    setSelectedNotifications([]);
    setSelectAll(false);
  };
  
  // Filter notifications based on filter and search term
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.isRead) ||
                         (filter === notification.type);
                         
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
                         
    return matchesFilter && (searchTerm === '' || matchesSearch);
  });

  // Get notification icon based on type
  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'payment':
        return <Calendar className={`h-6 w-6 ${priority === 'high' ? 'text-red-500' : priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />;
      case 'meeting':
        return <Clock className={`h-6 w-6 ${priority === 'high' ? 'text-red-500' : priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />;
      case 'loan':
        return <AlertCircle className={`h-6 w-6 ${priority === 'high' ? 'text-red-500' : priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />;
      case 'group':
        return <MessageSquare className={`h-6 w-6 ${priority === 'high' ? 'text-red-500' : priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />;
      case 'system':
        return <Info className={`h-6 w-6 ${priority === 'high' ? 'text-red-500' : priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />;
      default:
        return <Bell className={`h-6 w-6 ${priority === 'high' ? 'text-red-500' : priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 w-full">
        {/* Skeleton loading state */}
        <div className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with important information</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button variant="outline" className="flex items-center" onClick={() => toast.info('Settings page')}>
            <Settings className="h-4 w-4 mr-2" />
            Notification Settings
          </Button>
        </div>
      </div>
      
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="relative">
            <select
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="payment">Payment</option>
              <option value="meeting">Meeting</option>
              <option value="loan">Loan</option>
              <option value="group">Group</option>
              <option value="system">System</option>
            </select>
            <Filter className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        {selectedNotifications.length > 0 && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center" onClick={handleMarkAsRead}>
              <MailOpen className="h-4 w-4 mr-2" />
              Mark as Read
            </Button>
            <Button variant="outline" size="sm" className="flex items-center text-red-600 hover:text-red-700 hover:border-red-700" onClick={handleDeleteSelected}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>
      
      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-md">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <span className="ml-3 text-sm font-medium text-gray-700">
                {selectedNotifications.length > 0 
                  ? `Selected ${selectedNotifications.length} item${selectedNotifications.length === 1 ? '' : 's'}`
                  : 'Select All'}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {filteredNotifications.length} notification{filteredNotifications.length === 1 ? '' : 's'}
            </span>
          </div>
          
          {filteredNotifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`p-4 border ${notification.isRead ? 'border-gray-200 bg-white' : 'border-primary-100 bg-primary-50'}`}
            >
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                  />
                </div>
                <div className="ml-3 flex-shrink-0">
                  {getNotificationIcon(notification.type, notification.priority)}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-medium ${notification.isRead ? 'text-gray-900' : 'text-primary-900'}`}>
                      {notification.title}
                      {!notification.isRead && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                          New
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-gray-500">{formatDate(notification.date)}</span>
                  </div>
                  <p className={`mt-1 text-sm ${notification.isRead ? 'text-gray-600' : 'text-primary-700'}`}>
                    {notification.message}
                  </p>
                  <div className="mt-2 flex items-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                      ${notification.type === 'payment' ? 'bg-blue-100 text-blue-800' :
                        notification.type === 'meeting' ? 'bg-purple-100 text-purple-800' :
                        notification.type === 'loan' ? 'bg-green-100 text-green-800' :
                        notification.type === 'group' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                    </span>
                    {notification.isRead ? (
                      <span className="ml-2 text-xs text-gray-500 flex items-center">
                        <CheckCheck className="h-3 w-3 mr-1" />
                        Read
                      </span>
                    ) : (
                      <button 
                        className="ml-2 text-xs text-primary-600 hover:text-primary-800"
                        onClick={() => {
                          setNotifications(notifications.map(n => 
                            n.id === notification.id ? { ...n, isRead: true } : n
                          ));
                          toast.success('Marked as read');
                        }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 border border-gray-200 bg-white">
          <div className="text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'No notifications match your current filters.' 
                : 'You don\'t have any notifications at the moment.'}
            </p>
            {(searchTerm || filter !== 'all') && (
              <div className="mt-6">
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage; 