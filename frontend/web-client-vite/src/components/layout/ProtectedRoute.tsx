import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { toast } from 'react-toastify';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string | string[]; // Accept single role or array of roles
  groupId?: string; // For group-specific permissions
  isAuthenticated?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles,
  groupId,
  isAuthenticated: propIsAuthenticated
}) => {
  const { 
    isAuthenticated: storeIsAuthenticated, 
    user, 
    checkAuth,
    hasRole,
    hasAnyRole
  } = useAuthStore();
  
  const location = useLocation();
  const isDevelopment = import.meta.env.DEV || false;
  
  useEffect(() => {
    // Check authentication status when route changes
    checkAuth();
  }, [location.pathname, checkAuth]);
  
  // Use prop isAuthenticated if provided, otherwise use the one from store
  const isUserAuthenticated = propIsAuthenticated !== undefined ? propIsAuthenticated : storeIsAuthenticated;
  
  // Skip strict authentication checks in development mode, but still use the store
  if (isDevelopment && import.meta.env.VITE_BYPASS_AUTH === 'true' && !isUserAuthenticated) {
    // In development, simulate authentication if not already authenticated
    console.warn('Development mode: Bypassing authentication check');
    return <>{children}</>;
  }
  
  // Check if user is authenticated
  if (!isUserAuthenticated) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  // Convert requiredRoles to array if it's a string
  const roles = requiredRoles 
    ? (typeof requiredRoles === 'string' ? [requiredRoles] : requiredRoles) 
    : [];
  
  // Group-specific role check
  if (groupId && user) {
    // Check if user is a manager of this group
    const isGroupManager = user.managerOfGroups?.some(group => 
      typeof group === 'string' ? group === groupId : group.id === groupId
    );
    
    // If the route requires manager role for this group
    if (roles.includes('manager') && !isGroupManager && !hasRole('admin')) {
      toast.error('You need manager access for this group');
      return <Navigate to={`/member/group/${groupId}`} replace />;
    }
  }
  
  // General role check - if any roles are required
  if (roles.length > 0 && user) {
    // Check if user has any of the required roles
    const userHasRequiredRole = hasAnyRole(roles);
    
    if (!userHasRequiredRole) {
      toast.error(`You need ${roles.join(' or ')} access for this page`);
    
      // Redirect based on user's primary role
      if (user.primaryRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (user.primaryRole === 'manager') {
        return <Navigate to="/manager/dashboard" replace />;
      } else if (user.primaryRole === 'user') {
        return <Navigate to="/member/dashboard" replace />;
      } else {
        return <Navigate to="/member/dashboard" replace />;
      }
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute; 