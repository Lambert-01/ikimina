import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  DollarSign,
  CreditCard,
  Bell,
  Settings,
  BarChart3,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  PlusCircle,
  FileText,
  Calendar,
  LifeBuoy,
  UserCog,
  Building,
  PiggyBank,
  Shield
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
  userRole?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  section?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar, userRole = 'member' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuthStore();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'My Groups': true,
    'Financial': true,
    'Management': true
  });

  // Define navigation based on user role
  const getNavigation = (): NavItem[] => {
    const baseNavigation = [
      { name: 'Dashboard', href: `/dashboard/${userRole}`, icon: Home, section: 'Main' },
    ];
    
    if (userRole === 'manager') {
      return [
        ...baseNavigation,
        { name: 'My Managed Groups', href: '/dashboard/manager/groups', icon: Building, section: 'Management', badge: '3' },
        { name: 'Members', href: '/dashboard/manager/members', icon: Users, section: 'Management' },
        { name: 'Contributions', href: '/dashboard/manager/contributions', icon: DollarSign, section: 'Financial' },
        { name: 'Loans', href: '/dashboard/manager/loans', icon: CreditCard, section: 'Financial', badge: '2', badgeColor: 'bg-amber-500' },
        { name: 'Meetings', href: '/dashboard/manager/meetings', icon: Calendar, section: 'Management' },
        { name: 'Reports', href: '/dashboard/manager/reports', icon: FileText, section: 'Financial' },
        { name: 'Notifications', href: '/dashboard/manager/notifications', icon: Bell, section: 'Main', badge: '5', badgeColor: 'bg-red-500' },
        { name: 'Settings', href: '/dashboard/manager/settings', icon: Settings, section: 'Main' },
      ];
    } else if (userRole === 'admin') {
      return [
        ...baseNavigation,
        { name: 'User Management', href: '/dashboard/admin/users', icon: UserCog, section: 'Management' },
        { name: 'Group Management', href: '/dashboard/admin/groups', icon: Building, section: 'Management' },
        { name: 'System Settings', href: '/dashboard/admin/settings', icon: Settings, section: 'Main' },
        { name: 'Reports & Analytics', href: '/dashboard/admin/reports', icon: BarChart3, section: 'Financial' },
        { name: 'Compliance', href: '/dashboard/admin/compliance', icon: Shield, section: 'Management' },
        { name: 'Support Tickets', href: '/dashboard/admin/support', icon: LifeBuoy, section: 'Main' },
      ];
    } else {
      return [
        ...baseNavigation,
        { name: 'My Groups', href: '/dashboard/member/group', icon: Users, section: 'My Groups', badge: '2' },
        { name: 'Contributions', href: '/dashboard/member/contributions', icon: DollarSign, section: 'Financial' },
        { name: 'Loans', href: '/dashboard/member/loans', icon: CreditCard, section: 'Financial' },
        { name: 'Savings', href: '/dashboard/member/savings', icon: PiggyBank, section: 'Financial' },
        { name: 'Reports', href: '/dashboard/member/reports', icon: FileText, section: 'Financial' },
        { name: 'Meetings', href: '/dashboard/member/meetings', icon: Calendar, section: 'My Groups' },
        { name: 'Notifications', href: '/dashboard/member/notifications', icon: Bell, section: 'Main', badge: '3', badgeColor: 'bg-blue-500' },
        { name: 'Create Group', href: '/dashboard/member/create-group', icon: PlusCircle, section: 'My Groups' },
        { name: 'Join Group', href: '/dashboard/member/join-group', icon: UserPlus, section: 'My Groups' },
        { name: 'Settings', href: '/dashboard/member/settings', icon: Settings, section: 'Main' },
      ];
    }
  };

  const navigation = getNavigation();
  
  // Group navigation items by section
  const groupedNavigation = navigation.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section || 'Main';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = () => {
    logout();
    // Redirect is handled automatically by protected routes
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <Link to="/" className="flex items-center">
              {!collapsed && (
                <span className="text-xl font-bold">IKIMINA</span>
              )}
              {collapsed && <span className="text-xl font-bold">IK</span>}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md text-white hover:bg-primary-500 focus:outline-none hidden lg:block"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <button
              onClick={closeSidebar}
              className="p-1 rounded-md text-white hover:bg-primary-500 focus:outline-none lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Role selector */}
          {!collapsed && (
            <div className="px-4 py-3 border-b bg-gray-50">
              <select
                className="w-full px-3 py-2 text-sm border rounded-md bg-white shadow-sm focus:ring-primary-500 focus:border-primary-500"
                defaultValue={userRole}
                onChange={(e) => {
                  // In a real app, this would switch between roles if the user has multiple roles
                  window.location.href = `/dashboard/${e.target.value}`;
                }}
              >
                <option value="member">View as Member</option>
                <option value="manager">View as Manager</option>
                {/* Admin option would only show for admin users */}
              </select>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
            {Object.entries(groupedNavigation).map(([section, items]) => (
              <div key={section} className="mb-4">
                {!collapsed && section !== 'Main' && (
                  <div 
                    className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSection(section)}
                  >
                    <span>{section}</span>
                    <ChevronDown 
                      size={14} 
                      className={`transform transition-transform ${expandedSections[section] ? 'rotate-0' : '-rotate-90'}`} 
                    />
                  </div>
                )}
                
                <div className={`space-y-1 ${!expandedSections[section] && !collapsed ? 'hidden' : ''}`}>
                  {items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={closeSidebar}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={`mr-3 h-5 w-5 ${
                              isActive ? 'text-primary-500' : 'text-gray-400'
                            }`}
                          />
                          {!collapsed && <span>{item.name}</span>}
                        </div>
                        
                        {!collapsed && item.badge && (
                          <span className={`${item.badgeColor || 'bg-primary-500'} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="w-5 h-5 mr-2" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 