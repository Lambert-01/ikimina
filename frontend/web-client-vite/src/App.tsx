import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

// Homepage
import HomePage from './pages/homepage'

// Auth components
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'

// Dashboard layout
import DashboardLayout from './components/layout/DashboardLayout'

// Manager pages
import ManagerDashboard from './pages/manager/dashboard'
import ManagerMembersPage from './pages/manager/members'
import ManagerContributionsPage from './pages/manager/contributions'
import ManagerLoansPage from './pages/manager/loans'
import ManagerReportsPage from './pages/manager/reports'
import ManagerSettingsPage from './pages/manager/settings'

// Member pages
import MemberDashboard from './pages/member/dashboard'
import CreateGroupPage from './pages/member/create-group'
import JoinGroupPage from './pages/member/join-group'
import GroupStatusPage from './pages/member/group-status'
import MemberGroupPage from './pages/member/group'
import MemberContributionsPage from './pages/member/contributions'
import MemberLoansPage from './pages/member/loans'
import MemberNotificationsPage from './pages/member/notifications'
import MemberSavingsPage from './pages/member/savings'
import MemberReportsPage from './pages/member/reports'
import EnhancedSettingsPage from './pages/member/settings'

// Protected route
import ProtectedRoute from './components/layout/ProtectedRoute'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<'member' | 'manager' | null>(null)

  useEffect(() => {
    // Check if user is logged in (e.g., from localStorage or session)
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token')
      const role = localStorage.getItem('userRole') as 'member' | 'manager' | null
      
      if (token) {
        setIsLoggedIn(true)
        setUserRole(role)
      }
    }

    checkLoginStatus()
  }, [])

  const handleLogin = (role: 'member' | 'manager') => {
    // In a real app, this would be handled by an authentication service
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('userRole', role)
    setIsLoggedIn(true)
    setUserRole(role)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    setIsLoggedIn(false)
    setUserRole(null)
  }

  return (
    <>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Manager routes */}
          <Route 
            path="/manager" 
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn && userRole === 'manager'}>
                <DashboardLayout userRole="manager" onLogout={handleLogout} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="members" element={<ManagerMembersPage />} />
            <Route path="contributions" element={<ManagerContributionsPage />} />
            <Route path="loans" element={<ManagerLoansPage />} />
            <Route path="reports" element={<ManagerReportsPage />} />
            <Route path="settings" element={<EnhancedSettingsPage />} />
          </Route>

          {/* Member routes */}
          <Route 
            path="/member" 
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn && userRole === 'member'}>
                <DashboardLayout userRole="member" onLogout={handleLogout} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/member/dashboard" replace />} />
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="create-group" element={<CreateGroupPage />} />
            <Route path="join-group" element={<JoinGroupPage />} />
            <Route path="group-status" element={<GroupStatusPage />} />
            <Route path="group/:groupId" element={<MemberGroupPage />} />
            <Route path="contributions" element={<MemberContributionsPage />} />
            <Route path="loans" element={<MemberLoansPage />} />
            <Route path="notifications" element={<MemberNotificationsPage />} />
            <Route path="savings" element={<MemberSavingsPage />} />
            <Route path="reports" element={<MemberReportsPage />} />
            <Route path="settings" element={<EnhancedSettingsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" />
    </>
  )
}

export default App
