import { useEffect } from 'react'
import { 
  Navigate, 
  useLocation, 
  Outlet,
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

// Homepage (Landing page)
import HomePage from './pages/homepage'

// Auth components
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'

// Dashboard layout and pages
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import GroupDashboard from './pages/GroupDashboard'
import JoinGroupPage from './pages/member/join-group'
import CreateGroupPage from './pages/member/create-group'
import MyGroupsPage from './pages/member/my-groups'
import MemberContributionsPage from './pages/member/contributions'
import MemberLoansPage from './pages/member/loans'
import MemberMeetingsPage from './pages/member/meetings'
import MemberMessagesPage from './pages/member/messages'
import MemberReportsPage from './pages/member/reports'
import SettingsPage from './pages/member/settings'

// Admin pages
import AdminLayout from './components/admin/AdminLayout'
import AdminLogin from './pages/admin/login'
import AdminDashboard from './pages/admin/dashboard'
import AdminGroups from './pages/admin/groups'
import AdminUsers from './pages/admin/users'
import AdminGroupManagement from './pages/admin/group-management'

// Protected route
import ProtectedRoute from './components/layout/ProtectedRoute'

// Theme provider
import { ThemeProvider } from './components/ui/theme-provider'

// Auth store
import useAuthStore from './store/authStore'

// Layout wrapper component
const DashboardLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

// Admin protected route component
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const adminToken = localStorage.getItem('adminToken');
  
  if (!adminToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check auth status when app loads
    checkAuth();
  }, [checkAuth]);

  // Create router with future flags to fix warnings
  const router = createBrowserRouter([
    // Public routes
    { 
      path: "/", 
      element: <HomePage />
    },
    { path: "/login", element: <LoginForm /> },
    { path: "/register", element: <RegisterForm /> },
    
    // Admin routes - completely separate from user routes
    { path: "/admin/login", element: <AdminLogin /> },
    {
      path: "/admin",
      element: <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>,
      children: [
        { path: "dashboard", element: <AdminDashboard /> },
        { path: "groups", element: <AdminGroups /> },
        { path: "group-management", element: <AdminGroupManagement /> },
        { path: "groups/:id", element: <div>Group Detail (Coming Soon)</div> },
        { path: "users", element: <AdminUsers /> },
        { path: "loans", element: <div>Loans Management (Coming Soon)</div> },
        { path: "settings", element: <div>Admin Settings (Coming Soon)</div> },
        { index: true, element: <Navigate to="/admin/dashboard" replace /> }
      ]
    },
    
    // Unified Dashboard routes (for all authenticated users)
    {
      path: "/dashboard",
      element: <ProtectedRoute requiredRoles={['member', 'manager', 'user', 'admin']}><DashboardLayoutWrapper><Outlet /></DashboardLayoutWrapper></ProtectedRoute>,
      children: [
        { index: true, element: <Dashboard /> },
        { path: "join-group", element: <JoinGroupPage /> },
        { path: "create-group", element: <CreateGroupPage /> },
        { path: "my-groups", element: <MyGroupsPage /> },
        { path: "group/:groupId/*", element: <GroupDashboard /> },
        { path: "contributions", element: <MemberContributionsPage /> },
        { path: "loans", element: <MemberLoansPage /> },
        { path: "meetings", element: <MemberMeetingsPage /> },
        { path: "messages", element: <MemberMessagesPage /> },
        { path: "reports", element: <MemberReportsPage /> },
        { path: "settings", element: <SettingsPage /> },
        
        // Manager-specific routes
        { path: "manager/group/:groupId", element: <div>Manager Group View (Coming Soon)</div> },
        { path: "manager/approvals", element: <div>Loan Approvals (Coming Soon)</div> },
        { path: "manager/reports", element: <div>Manager Reports (Coming Soon)</div> },
      ]
    },
    
    // Member routes
    {
      path: "/member",
      element: <ProtectedRoute requiredRoles={['member', 'manager', 'user', 'admin']}><DashboardLayoutWrapper><Outlet /></DashboardLayoutWrapper></ProtectedRoute>,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: "join-group", element: <JoinGroupPage /> },
        { path: "create-group", element: <CreateGroupPage /> },
        { path: "my-groups", element: <MyGroupsPage /> },
        { path: "contributions", element: <MemberContributionsPage /> },
        { path: "loans", element: <MemberLoansPage /> },
        { path: "meetings", element: <MemberMeetingsPage /> },
        { path: "messages", element: <MemberMessagesPage /> },
        { path: "reports", element: <MemberReportsPage /> },
        { path: "settings", element: <SettingsPage /> },
      ]
    },
    {
      path: "/manager/*", 
      element: <Navigate to="/dashboard" replace />
    },
    
    // Catch-all redirect
    { path: "*", element: <Navigate to="/" replace /> }
  ], {
    future: {
      v7_relativeSplatPath: true
    }
  });

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <ToastContainer position="bottom-right" theme="colored" />
    </ThemeProvider>
  )
}

export default App
