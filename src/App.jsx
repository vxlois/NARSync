import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import AppShell from './components/AppShell'
import Button from './components/ui/Button'
import EmptyState from './components/ui/EmptyState'
import { useApp } from './context/AppContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DutyDetailsPage from './pages/DutyDetailsPage'
import FaceRegistrationPage from './pages/FaceRegistrationPage'
import AttendanceHubPage from './pages/AttendanceHubPage'
import CapturePage from './pages/CapturePage'
import ReviewPage from './pages/ReviewPage'
import SuccessPage from './pages/SuccessPage'
import HistoryPage from './pages/HistoryPage'
import RecordDetailsPage from './pages/RecordDetailsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import AdminApp from './admin/AdminApp'

function RequireAuth() {
  const { isAuthenticated } = useApp()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

function LoginRoute() {
  const { isAuthenticated } = useApp()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
}

function RootRedirect() {
  const { isAuthenticated } = useApp()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="screen not-found">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The screen you are looking for does not exist."
        action={
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </Button>
        }
      />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginRoute />} />

          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/duty" element={<DutyDetailsPage />} />
            <Route path="/face-registration" element={<FaceRegistrationPage />} />
            <Route path="/attendance" element={<AttendanceHubPage />} />
            <Route path="/attendance/:type/capture" element={<CapturePage />} />
            <Route path="/attendance/:type/review" element={<ReviewPage />} />
            <Route path="/attendance/success/:recordId" element={<SuccessPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/:recordId" element={<RecordDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
