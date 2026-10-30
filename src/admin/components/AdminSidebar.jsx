import { NavLink } from 'react-router-dom'
import { GraduationCap, ShieldCheck } from 'lucide-react'
import { useAdmin } from '../AdminContext'
import Avatar from './Avatar'
import { ADMIN_NAV } from './adminNav'

export default function AdminSidebar({ open, onClose }) {
  const { currentUser, canManage, openFlagCount } = useAdmin()

  return (
    <>
      <button
        type="button"
        className={`adm-sidebar-scrim ${open ? 'is-open' : ''}`}
        aria-label="Close navigation"
        onClick={onClose}
      />
      <aside className={`adm-sidebar ${open ? 'is-open' : ''}`} aria-label="Admin navigation">
        <div className="adm-brand">
          <span className="adm-brand__mark" aria-hidden="true">
            N
          </span>
          <span className="adm-brand__copy">
            <strong>NARSync</strong>
            <span>RLE Administration</span>
          </span>
        </div>

        <div className="adm-workspace">
          <span className="adm-workspace__icon" aria-hidden="true">
            <GraduationCap size={16} />
          </span>
          <span>
            <strong>Nursing Department</strong>
            <small>Bicol University Polangui</small>
          </span>
        </div>

        <nav className="adm-nav">
          <p className="adm-nav__label">Workspace</p>
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon
            const badge = item.badge === 'flags' ? openFlagCount : null
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `adm-nav__link ${isActive ? 'is-active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
                {badge > 0 && <span className="adm-nav__badge">{badge}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className="adm-sidebar__foot">
          <div className="adm-role-card">
            <Avatar name={currentUser.name} size="sm" />
            <div className="adm-role-card__copy">
              <strong>{currentUser.name}</strong>
              <span>{currentUser.label}</span>
            </div>
          </div>
          <p className="adm-access-note">
          </p>
        </div>
      </aside>
    </>
  )
}
