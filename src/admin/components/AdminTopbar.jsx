import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Check,
  ChevronDown,
  CircleAlert,
  ExternalLink,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  UserCog,
} from 'lucide-react'
import { useAdmin } from '../AdminContext'
import { ROLE_DEFINITIONS } from '../adminData'
import { dateKey, formatDateLong, formatDateMedium, formatTime } from '../../utils/format'
import Avatar from './Avatar'
import { getAdminPageMeta } from './adminNav'
import { useToast } from '../../context/ToastContext'

function notificationTime(iso) {
  return dateKey(new Date(iso)) === dateKey()
    ? `Today · ${formatTime(iso)}`
    : `${formatDateMedium(iso)} · ${formatTime(iso)}`
}

export default function AdminTopbar({ onOpenNav }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    currentUser,
    role,
    setRole,
    canManage,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAdmin()
  const meta = getAdminPageMeta(pathname)
  const [query, setQuery] = useState('')
  const [today] = useState(() => new Date())
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const showSearch = pathname === '/admin' || pathname === '/admin/'

  useEffect(() => {
    setNotifOpen(false)
    setProfileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!notifOpen && !profileOpen) return undefined
    const handlePointer = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false)
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setNotifOpen(false)
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [notifOpen, profileOpen])

  const handleSearch = (event) => {
    event.preventDefault()
    const term = query.trim()
    navigate(term ? `/admin/students?q=${encodeURIComponent(term)}` : '/admin/students')
  }

  const handleRoleChange = (nextRole) => {
    if (nextRole === role) {
      setProfileOpen(false)
      return
    }
    setRole(nextRole)
    setProfileOpen(false)
    toast(`Now viewing as ${ROLE_DEFINITIONS[nextRole].label}.`, 'success')
  }

  const handleNotification = (notification) => {
    markNotificationRead(notification.id)
    setNotifOpen(false)
    navigate(notification.href)
  }

  return (
    <header className="adm-topbar">
      <div className="adm-topbar__left">
        <button
          type="button"
          className="adm-icon-btn adm-menu-btn"
          aria-label="Open navigation"
          onClick={onOpenNav}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <div className="adm-title-block">
          <p>
            {meta.section}
            <time dateTime={dateKey(today)}>{formatDateLong(today)}</time>
          </p>
          <h1>{meta.title}</h1>
        </div>
      </div>

      <div className="adm-topbar__right">
        {showSearch && (
          <form className="adm-topbar-search" role="search" onSubmit={handleSearch}>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search students by name or ID"
              aria-label="Search students by name or ID"
            />
            <kbd>Enter</kbd>
          </form>
        )}

        {!canManage && (
          <span className="adm-view-chip">
            <ShieldCheck size={14} aria-hidden="true" />
            View-only
          </span>
        )}

        <div className="adm-popover-wrap" ref={notifRef}>
          <button
            type="button"
            className={`adm-icon-btn ${notifOpen ? 'is-active' : ''}`}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={notifOpen}
            onClick={() => {
              setNotifOpen((current) => !current)
              setProfileOpen(false)
            }}
          >
            <Bell size={19} aria-hidden="true" />
            {unreadCount > 0 && <span className="adm-notif-dot" aria-hidden="true" />}
          </button>

          {notifOpen && (
            <div className="adm-popover adm-popover--notifications">
              <div className="adm-popover__head">
                <div>
                  <strong>Notifications</strong>
                  <span>{unreadCount ? `${unreadCount} unread` : 'All caught up'}</span>
                </div>
                {unreadCount > 0 && (
                  <button type="button" className="adm-text-btn" onClick={markAllNotificationsRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="adm-notification-list">
                {notifications.map((notification) => (
                  <button
                    type="button"
                    key={notification.id}
                    className={`adm-notification ${notification.read ? '' : 'is-unread'}`}
                    onClick={() => handleNotification(notification)}
                  >
                    <span
                      className={`adm-notification__icon adm-notification__icon--${notification.tone}`}
                      aria-hidden="true"
                    >
                      {notification.tone === 'danger' ? (
                        <CircleAlert size={16} />
                      ) : (
                        <Bell size={16} />
                      )}
                    </span>
                    <span className="adm-notification__copy">
                      <strong>{notification.title}</strong>
                      <span>{notification.body}</span>
                      <small>{notificationTime(notification.at)}</small>
                    </span>
                    {!notification.read && <span className="adm-unread-dot" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="adm-popover-wrap" ref={profileRef}>
          <button
            type="button"
            className={`adm-profile-btn ${profileOpen ? 'is-active' : ''}`}
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((current) => !current)
              setNotifOpen(false)
            }}
          >
            <Avatar name={currentUser.name} size="sm" />
            <span className="adm-profile-btn__copy">
              <strong>{currentUser.name}</strong>
              <span>{currentUser.label}</span>
            </span>
            <ChevronDown size={15} aria-hidden="true" />
          </button>

          {profileOpen && (
            <div className="adm-popover adm-popover--profile">
              <div className="adm-profile-card">
                <Avatar name={currentUser.name} size="md" />
                <div>
                  <strong>{currentUser.name}</strong>
                  <span>{currentUser.email}</span>
                  <small>
                    <ShieldCheck size={12} aria-hidden="true" /> {currentUser.scope}
                  </small>
                </div>
              </div>

              <div className="adm-popover__section">
                <p className="adm-popover__label">
                  <UserCog size={13} aria-hidden="true" /> Preview role
                </p>
                {Object.values(ROLE_DEFINITIONS).map((roleOption) => (
                  <button
                    type="button"
                    key={roleOption.id}
                    className={`adm-menu-item ${roleOption.id === role ? 'is-selected' : ''}`}
                    onClick={() => handleRoleChange(roleOption.id)}
                  >
                    <span>
                      <strong>{roleOption.label}</strong>
                      <small>{roleOption.scope}</small>
                    </span>
                    {roleOption.id === role && <Check size={16} aria-hidden="true" />}
                  </button>
                ))}
              </div>

              <div className="adm-popover__section adm-popover__section--links">
                <Link to="/admin/settings" className="adm-menu-link" onClick={() => setProfileOpen(false)}>
                  <Settings size={16} aria-hidden="true" />
                  Workspace settings
                </Link>
                <Link to="/login" className="adm-menu-link" onClick={() => setProfileOpen(false)}>
                  <ExternalLink size={16} aria-hidden="true" />
                  Open student app
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}