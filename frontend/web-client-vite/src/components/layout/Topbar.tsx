import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User, Search, LogOut } from 'lucide-react';
import { Button } from '../ui/button';

interface TopbarProps {
  toggleSidebar: () => void;
  onLogout?: () => void;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  } | null;
}

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar, user, onLogout }) => {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu button & Logo */}
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            
            <div className="hidden lg:flex lg:items-center lg:ml-2">
              <span className="text-lg font-semibold text-gray-800">
                {user?.role === 'manager' ? 'Manager Dashboard' : 'Member Dashboard'}
              </span>
            </div>
          </div>

          {/* Center: Search (optional) */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
            </button>
            
            {/* Profile dropdown */}
            <div className="relative">
              <Link to="/dashboard/member/settings" className="flex items-center space-x-3 p-1 rounded-full hover:bg-gray-100">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-sm">
                    {user?.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">
                    {user ? `${user.firstName || ''} ${user.lastName || ''}` : 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role || 'member'}
                  </p>
                </div>
              </Link>
            </div>
            
            {/* Logout button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Logout"
              >
                <span className="sr-only">Logout</span>
                <LogOut className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar; 