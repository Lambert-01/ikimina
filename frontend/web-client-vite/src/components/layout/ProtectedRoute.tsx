import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { toast } from 'react-toastify';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  isAuthenticated?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  isAuthenticated: propIsAuthenticated
}) => {
  const { isAuthenticated: storeIsAuthenticated, user } = useAuthStore();
  const isDevelopment = import.meta.env.MODE === 'development';
  
  // Use prop isAuthenticated if provided, otherwise use the one from store
  const isUserAuthenticated = propIsAuthenticated !== undefined ? propIsAuthenticated : storeIsAuthenticated;
  
  // Skip authentication in development mode
  if (isDevelopment) {
    return <>{children}</>;
  }
  
  // Check if user is authenticated
  if (!isUserAuthenticated) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has required role
  if (requiredRole && user?.role !== requiredRole) {
    toast.error(`You need ${requiredRole} access for this page`);
    
    // Redirect based on user's role
    if (user?.role === 'manager') {
      return <Navigate to="/dashboard/manager" replace />;
    } else if (user?.role === 'member') {
      return <Navigate to="/dashboard/member" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute; 