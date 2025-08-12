import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Wallet,
  BarChart,
  Calendar,
  Settings,
  CreditCard,
  PlusCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  CircleDollarSign,
  Building,
  FileText,
  MessageCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Types
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  collapsed?: boolean;
  active?: boolean;
  badge?: number | string;
  badgeColor?: string;
  onClick?: () => void;
}

interface NavGroupProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  collapsed?: boolean;
  defaultOpen?: boolean;
}

interface SidebarProps {
  collapsed: boolean;
  user: any | null;
  pathname: string;
  onLogout: () => void;
  isMobile?: boolean;
  closeMobileMenu?: () => void;
}

// NavItem component for regular menu items
const NavItem: React.FC<NavItemProps> = ({ 
  icon, 
  label, 
  path, 
  collapsed = false, 
  active = false,
  badge,
  badgeColor = 'bg-primary-500',
  onClick
}) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center py-3 px-4 rounded-md transition-colors",
        active 
          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400" 
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60",
        collapsed ? "justify-center" : "justify-between"
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={cn(
          "flex-shrink-0",
          collapsed ? "" : "mr-3"
        )}>
          {icon}
        </div>
        {!collapsed && <span className="text-sm font-medium">{label}</span>}
      </div>
      
      {!collapsed && badge && (
        <span className={cn(
          "px-2 py-0.5 text-xs font-medium text-white rounded-full",
          badgeColor
        )}>
          {badge}
        </span>
      )}
      
      {collapsed && badge && (
        <span className={cn(
          "absolute top-0 right-0 h-5 w-5 text-xs flex items-center justify-center font-medium text-white rounded-full -mt-1 -mr-1",
          badgeColor
        )}>
          {badge}
        </span>
      )}
    </Link>
  );
};

// NavGroup component for expandable sections
const NavGroup: React.FC<NavGroupProps> = ({ 
  icon, 
  label, 
  children, 
  collapsed = false,
  defaultOpen = false
}) => {
  const [open, setOpen] = useState(defaultOpen);
  
  // Don't allow toggling in collapsed mode
  const toggleOpen = () => {
    if (!collapsed) {
      setOpen(!open);
    }
  };

  return (
    <div>
      <button
        onClick={toggleOpen}
        className={cn(
          "w-full flex items-center py-3 px-4 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <div className="flex items-center">
    <div className={cn(
            "flex-shrink-0",
            collapsed ? "" : "mr-3"
    )}>
            {icon}
          </div>
          {!collapsed && <span className="text-sm font-medium">{label}</span>}
        </div>
        {!collapsed && (open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
      </button>
      
      {!collapsed && open && (
        <div className="pl-9 pr-4 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

// Sidebar component
const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  user, 
  pathname,
  onLogout,
  isMobile = false,
  closeMobileMenu
}) => {
  const location = useLocation();
  
  // Get groups from user object
  const memberGroups = user?.memberGroups || [];
  const managedGroups = user?.managedGroups || [];
  
  // Check if path is active
  const isActive = (path: string) => pathname.startsWith(path);
  
  // Handle navigation on mobile
  const handleNavigation = () => {
    if (isMobile && closeMobileMenu) {
      closeMobileMenu();
    }
  };
  
  const isManager = managedGroups.length > 0;
  const isMember = memberGroups.length > 0;
  
  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="px-3 py-4">
        {/* Member Section */}
        <div className="mb-6">
          {!collapsed && (
            <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Member
            </h3>
          )}
          
          <nav className="space-y-1">
            <NavItem
              icon={<Home className="h-5 w-5" />}
              label="Dashboard"
              path="/dashboard"
              active={isActive('/dashboard')}
              collapsed={collapsed}
              onClick={handleNavigation}
            />
            
            <NavGroup
              icon={<Users className="h-5 w-5" />}
              label="My Groups"
              collapsed={collapsed}
              defaultOpen={isActive('/member/group')}
            >
              {/* List member groups */}
                              {memberGroups.length > 0 ? (
                memberGroups.map((group: string, index: number) => (
                      <Link
                    key={group} 
                    to={`/dashboard/group/${group}`}
                    className="flex items-center py-2 pl-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                    onClick={handleNavigation}
                  >
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    {`Group ${index + 1}`}
                      </Link>
                ))
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400 py-2">No groups yet</div>
                )}
              
                <Link
                to="/dashboard/my-groups"
                className="flex items-center py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={handleNavigation}
              >
                <Users className="h-4 w-4 mr-2" />
                View All Groups
                </Link>
                
                <Link
                to="/dashboard/create-group"
                className="flex items-center py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                onClick={handleNavigation}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Group
                </Link>
                
                <Link
                to="/dashboard/join-group"
                className="flex items-center py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                onClick={handleNavigation}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Join Group
                </Link>
            </NavGroup>
            
            <NavItem
              icon={<CreditCard className="h-5 w-5" />}
              label="Contributions"
              path="/dashboard/contributions"
              active={isActive('/dashboard/contributions')}
              collapsed={collapsed}
              onClick={handleNavigation}
            />
            
            <NavItem
              icon={<Wallet className="h-5 w-5" />}
              label="Loans"
              path="/dashboard/loans"
              active={isActive('/dashboard/loans')}
              collapsed={collapsed}
              badge={2}
              badgeColor="bg-amber-500"
              onClick={handleNavigation}
            />
            
            <NavItem
              icon={<Calendar className="h-5 w-5" />}
              label="Meetings"
              path="/dashboard/meetings"
              active={isActive('/dashboard/meetings')}
              collapsed={collapsed}
              badge={1}
              badgeColor="bg-blue-500"
              onClick={handleNavigation}
            />
            
            <NavItem
              icon={<BarChart className="h-5 w-5" />}
              label="Reports"
              path="/dashboard/reports"
              active={isActive('/dashboard/reports')}
              collapsed={collapsed}
              onClick={handleNavigation}
            />
            
            <NavItem
              icon={<MessageCircle className="h-5 w-5" />}
              label="Messages"
              path="/dashboard/messages"
              active={isActive('/dashboard/messages')}
              collapsed={collapsed}
              badge={3}
              badgeColor="bg-red-500"
              onClick={handleNavigation}
            />
          </nav>
        </div>
        
        {/* Manager Section - Only show if user manages any groups */}
        {isManager && (
          <div className="mb-6">
            {!collapsed && (
              <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Manager
              </h3>
            )}
            
            <nav className="space-y-1">
              <NavGroup
                icon={<Building className="h-5 w-5" />}
                label="Managed Groups"
                collapsed={collapsed}
                defaultOpen={isActive('/manager/')}
              >
                {managedGroups.map((group: string, index: number) => (
                <Link
                    key={group} 
                    to={`/dashboard/manager/group/${group}`}
                    className="flex items-center py-2 pl-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                    onClick={handleNavigation}
                  >
                    <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                    {`Group ${index + 1}`}
                </Link>
                ))}
              </NavGroup>
              
              <NavItem
                icon={<CircleDollarSign className="h-5 w-5" />}
                label="Approvals"
                path="/dashboard/manager/approvals"
                active={isActive('/dashboard/manager/approvals')}
                collapsed={collapsed}
                badge={4}
                badgeColor="bg-orange-500"
                onClick={handleNavigation}
              />
              
              <NavItem
                icon={<FileText className="h-5 w-5" />}
                label="Manager Reports"
                path="/dashboard/manager/reports"
                active={isActive('/dashboard/manager/reports')}
                collapsed={collapsed}
                onClick={handleNavigation}
              />
            </nav>
          </div>
        )}
        
        {/* Settings and logout */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <nav className="space-y-1">
            <NavItem
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              path="/dashboard/settings"
              active={isActive('/dashboard/settings')}
              collapsed={collapsed}
              onClick={handleNavigation}
            />
            
            <button
              onClick={onLogout}
              className={cn(
                "w-full flex items-center py-3 px-4 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
                collapsed ? "justify-center" : ""
              )}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 