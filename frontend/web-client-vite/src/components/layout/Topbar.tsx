import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface TopbarProps {
  toggleMobileMenu: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  userAvatar: string;
  userName: string;
  onLogout: () => void;
}

const Topbar: React.FC<TopbarProps> = ({
  toggleMobileMenu,
  theme,
  toggleTheme,
  userAvatar,
  userName,
  onLogout
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationCount] = useState(3);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const toggleUserMenu = () => {
    setUserMenuOpen(prev => !prev);
    if (notificationsOpen) setNotificationsOpen(false);
  };
  
  const toggleNotifications = () => {
    setNotificationsOpen(prev => !prev);
    if (userMenuOpen) setUserMenuOpen(false);
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 z-30">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo and mobile menu button */}
        <div className="flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden mr-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <Link to="/" className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center mr-3">
              <span className="text-xl font-bold text-white">IK</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden md:block">
              Ikimina
            </span>
          </Link>
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700" />
            )}
          </Button>
          
          {/* Notifications */}
          <div className="relative">
            <Button
              onClick={toggleNotifications}
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>
            
            {/* Notifications dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Your contribution was received</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 hours ago</p>
                  </div>
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">New meeting scheduled</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Yesterday</p>
                  </div>
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Your loan was approved</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">3 days ago</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 text-center border-t border-gray-200 dark:border-gray-700">
                  <Link to="/notifications" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* User menu */}
          <div className="relative">
            <Button
              onClick={toggleUserMenu}
              variant="ghost"
              className="flex items-center space-x-2 rounded-full py-1.5"
              aria-label="User menu"
            >
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                {userAvatar}
              </div>
              <span className="hidden md:block text-gray-900 dark:text-white">
                {userName}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </Button>
            
            {/* User dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Member</p>
                </div>
                <div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <User className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Settings className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Settings</span>
                  </Link>
                  <button
                    onClick={onLogout}
                    className="flex items-center px-4 py-2 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
                  >
                    <LogOut className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar; 