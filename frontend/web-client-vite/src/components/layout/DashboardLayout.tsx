import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu,
  Bell, 
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';
import useAuthStore from '../../store/authStore';
import { Button } from '../ui/button';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    localStorage.getItem('theme') as 'light' | 'dark' || 'light'
  );
  
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle theme switching
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Topbar */}
      <Topbar
        toggleMobileMenu={toggleMobileMenu}
        theme={theme}
        toggleTheme={toggleTheme}
        userAvatar={user?.firstName?.[0] || 'U'}
        userName={user?.firstName || 'User'}
        onLogout={handleLogout}
      />
      
      {/* Main Content */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar - Desktop */}
        <div className={cn(
          "fixed left-0 top-16 h-full z-20 transform transition-all duration-300 ease-in-out",
          isMobile ? "hidden" : "block",
          sidebarCollapsed ? "w-20" : "w-64"
        )}>
          <Sidebar 
            collapsed={sidebarCollapsed} 
            user={user} 
            pathname={location.pathname} 
            onLogout={handleLogout}
          />
          
          {/* Sidebar collapse button */}
          <button 
            onClick={toggleSidebar}
            className={cn(
              "absolute -right-3 top-1/2 transform -translate-y-1/2 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-1 shadow-lg transition-all",
              sidebarCollapsed ? "rotate-0" : "rotate-180"
            )}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed left-0 top-16 h-full z-40 w-64 transform transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar 
            collapsed={false} 
            user={user} 
            pathname={location.pathname} 
            onLogout={handleLogout} 
            isMobile={true}
            closeMobileMenu={() => setMobileMenuOpen(false)}
          />
        </div>
        
        {/* Main Content Area */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          isMobile ? "" : (sidebarCollapsed ? "ml-20" : "ml-64"),
          "pt-4 pb-12"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 