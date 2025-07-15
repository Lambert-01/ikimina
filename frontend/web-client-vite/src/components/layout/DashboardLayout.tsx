import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useAuthStore from '../../store/authStore';
import { authService } from '../../services';
import { toast } from 'react-toastify';
import { Loader2, Home, ChevronRight, HelpCircle, Bell, Users } from 'lucide-react';
import { Button } from '../ui/button';

interface DashboardLayoutProps {
  userRole?: string;
  onLogout?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ userRole: propUserRole, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isDevelopment = import.meta.env.MODE === 'development';

  // Extract current page from URL for breadcrumbs
  const getCurrentPageInfo = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Default values
    let pageTitle = 'Dashboard';
    let parentPath = '';
    let parentTitle = '';
    
    if (pathSegments.length >= 2) {
      const role = pathSegments[1]; // 'member', 'manager', etc.
      
      if (pathSegments.length >= 3) {
        const section = pathSegments[2]; // 'group', 'contributions', etc.
        pageTitle = section.charAt(0).toUpperCase() + section.slice(1);
        parentPath = `/${pathSegments[0]}/${role}`;
        parentTitle = 'Dashboard';
      }
    }
    
    return { pageTitle, parentPath, parentTitle };
  };
  
  const { pageTitle, parentPath, parentTitle } = getCurrentPageInfo();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Skip authentication check in development mode
        if (isDevelopment) {
          setLoading(false);
          return;
        }
        
        // Check if user is authenticated
        if (!authService.isAuthenticated) {
          toast.error('Please login to access the dashboard');
          navigate('/login');
          return;
        }

        // Get current user if not already in store
        const currentUser = user || authService.getCurrentUser();
        
        if (!currentUser) {
          toast.error('User session expired');
          navigate('/login');
          return;
        }

        // Redirect based on role if at root dashboard path
        if (window.location.pathname === '/dashboard') {
          if (currentUser.role === 'admin') {
            navigate('/dashboard/admin');
          } else if (currentUser.role === 'manager') {
            navigate('/dashboard/manager');
          } else {
            navigate('/dashboard/member');
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        toast.error('Authentication error');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, user, isDevelopment]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      authService.logout();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Development mode banner
  const DevBanner = () => {
    if (!isDevelopment) return null;
    
    return (
      <div className="bg-blue-600 text-white px-4 py-2 text-center">
        <p className="text-sm font-medium">
          Development Mode - No authentication required
          <Link to="/">
            <Button variant="outline" size="sm" className="ml-4 text-white border-white hover:bg-blue-700">
              <Home className="h-4 w-4 mr-1" /> Back to Homepage
            </Button>
          </Link>
        </p>
      </div>
    );
  };

  // Determine user role - use prop if provided, otherwise use from store or pathname
  const effectiveUserRole = propUserRole || user?.role || (window.location.pathname.includes('/manager') ? 'manager' : 'member');

  // Role-specific styles and colors
  const getRoleStyles = () => {
    switch (effectiveUserRole) {
      case 'manager':
        return {
          badge: 'bg-amber-500',
          roleText: 'Manager View'
        };
      case 'admin':
        return {
          badge: 'bg-red-500',
          roleText: 'Admin View'
        };
      default:
        return {
          badge: 'bg-blue-500',
          roleText: 'Member View'
        };
    }
  };

  const roleStyles = getRoleStyles();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DevBanner />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
        
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          closeSidebar={closeSidebar}
          userRole={effectiveUserRole}
        />
        
        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar toggleSidebar={toggleSidebar} user={user} onLogout={handleLogout} />
          
          {/* Page header with breadcrumbs */}
          <div className="bg-white border-b px-4 py-4 md:px-6 shadow-sm">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Link to={parentPath} className="hover:text-primary-600">
                      {parentTitle}
                    </Link>
                    {parentTitle && (
                      <>
                        <ChevronRight className="h-4 w-4 mx-1" />
                        <span className="font-medium text-gray-900">{pageTitle}</span>
                      </>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`${roleStyles.badge} text-white text-xs px-2 py-1 rounded-full font-medium`}>
                    {roleStyles.roleText}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
                      <Bell size={20} />
                    </button>
                    <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
                      <HelpCircle size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
          
          {/* Footer */}
          <footer className="bg-white border-t py-3 px-4 md:px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
              <div className="mb-2 md:mb-0">
                &copy; {new Date().getFullYear()} Ikimina. All rights reserved.
              </div>
              <div className="flex space-x-4">
                <Link to="/terms" className="hover:text-primary-600">Terms</Link>
                <Link to="/privacy" className="hover:text-primary-600">Privacy</Link>
                <Link to="/help" className="hover:text-primary-600">Help</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 