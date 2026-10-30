import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Flag,
  LayoutDashboard,
  MapPin,
  Settings,
  Users,
  UsersRound,
} from 'lucide-react'

export const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/groups', label: 'Groups', icon: UsersRound },
  { to: '/admin/schedules', label: 'Duty Schedules', icon: CalendarDays },
  { to: '/admin/locations', label: 'Clinical Locations', icon: MapPin },
  { to: '/admin/attendance', label: 'Attendance Records', icon: ClipboardList },
  { to: '/admin/flagged', label: 'Flagged Records', icon: Flag, badge: 'flags' },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export function getAdminPageMeta(pathname) {
  if (pathname === '/admin' || pathname === '/admin/') {
    return { title: 'Dashboard', section: 'Administration' }
  }
  if (pathname === '/admin/groups/new') {
    return { title: 'Create group', section: 'Groups' }
  }
  if (pathname.startsWith('/admin/groups/')) {
    return { title: 'Group details', section: 'Groups' }
  }
  const item = [...ADMIN_NAV]
    .sort((a, b) => b.to.length - a.to.length)
    .find((navItem) => pathname.startsWith(navItem.to))
  return {
    title: item?.label || 'Administration',
    section: item ? 'Administration' : 'NARSync',
  }
}
