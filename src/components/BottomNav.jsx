import { History, House, ScanLine, UserRound } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const ITEMS = [
  { to: '/dashboard', label: 'Home', icon: House, match: ['/dashboard', '/duty'] },
  { to: '/attendance', label: 'Attendance', icon: ScanLine, match: ['/attendance'] },
  { to: '/history', label: 'History', icon: History, match: ['/history'] },
  { to: '/profile', label: 'Profile', icon: UserRound, match: ['/profile', '/settings'] },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {ITEMS.map((item) => {
        const active = item.match.some(
          (path) => pathname === path || (path === '/history' && pathname.startsWith('/history/')),
        )
        const Icon = item.icon
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-item ${active ? 'is-active' : ''}`.trim()}
            aria-current={active ? 'page' : undefined}
          >
            <span className="nav-item__icon">
              <Icon size={20} strokeWidth={active ? 2.3 : 1.9} aria-hidden="true" />
            </span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
