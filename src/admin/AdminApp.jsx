import { Route, Routes, useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import AdminProvider from './AdminProvider'
import AdminShell from './components/AdminShell'
import EmptyState from './components/EmptyState'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminStudentsPage from './pages/AdminStudentsPage'
import AdminGroupsPage from './pages/AdminGroupsPage'
import AdminGroupNewPage from './pages/AdminGroupNewPage'
import AdminGroupDetailsPage from './pages/AdminGroupDetailsPage'
import AdminSchedulesPage from './pages/AdminSchedulesPage'
import AdminLocationsPage from './pages/AdminLocationsPage'
import AdminAttendancePage from './pages/AdminAttendancePage'
import AdminFlaggedPage from './pages/AdminFlaggedPage'
import AdminReportsPage from './pages/AdminReportsPage'
import AdminSettingsPage from './pages/AdminSettingsPage'

function AdminNotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="adm-page">
      <EmptyState
        icon={Compass}
        title="Page not found"
        action={
          <button type="button" className="adm-btn adm-btn--secondary" onClick={() => navigate('/admin')}>
            Back to dashboard
          </button>
        }
      />
    </div>
  )
}

export default function AdminApp() {
  return (
    <AdminProvider>
      <Routes>
        <Route path="/" element={<AdminShell />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="groups" element={<AdminGroupsPage />} />
          <Route path="groups/new" element={<AdminGroupNewPage />} />
          <Route path="groups/:groupId" element={<AdminGroupDetailsPage />} />
          <Route path="schedules" element={<AdminSchedulesPage />} />
          <Route path="locations" element={<AdminLocationsPage />} />
          <Route path="attendance" element={<AdminAttendancePage />} />
          <Route path="flagged" element={<AdminFlaggedPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="*" element={<AdminNotFoundPage />} />
        </Route>
      </Routes>
    </AdminProvider>
  )
}
