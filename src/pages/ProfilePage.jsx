import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ChevronRight,
  ClipboardList,
  History,
  LogOut,
  Settings,
} from 'lucide-react'
import FaceStatusCard from '../components/FaceStatusCard'
import { ConfirmSheet } from '../components/ui/Sheet'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { student, logout } = useApp()
  const [signOutOpen, setSignOutOpen] = useState(false)

  const handleSignOut = () => {
    setSignOutOpen(false)
    logout()
    navigate('/login', { replace: true })
    toast('Signed out of your student account.', 'default')
  }

  return (
    <div className="screen">
      <header className="tab-header">
        <div>
          <h1>Profile</h1>
          <p>Your student and RLE assignment details.</p>
        </div>
        <Link className="icon-button" to="/settings" aria-label="Open settings">
          <Settings size={19} aria-hidden="true" />
        </Link>
      </header>

      <section className="profile-card">
        <span className="profile-avatar" aria-hidden="true">{student.initials}</span>
        <p className="profile-card__id">Student ID {student.id}</p>
        <p className="profile-card__program">
          {student.program}
          <br />
          {student.yearLevel} · {student.section}
        </p>
        <div className="profile-card__badges">
          <Badge tone="violet">{student.group.name}</Badge>
        </div>
      </section>

      <section className="section">
        <h2 className="profile-section-title">Identity & assignment</h2>
        <FaceStatusCard />
        <div className="profile-links">
          <Link className="profile-link" to="/duty">
            <span className="profile-link__icon" aria-hidden="true">
              <ClipboardList size={17} />
            </span>
            <span className="profile-link__text">
              RLE duty assignment
              <small>
                {student.group.name} · {student.duty.facility}
              </small>
            </span>
            <ChevronRight className="profile-link__chevron" size={17} aria-hidden="true" />
          </Link>
          <Link className="profile-link" to="/history">
            <span className="profile-link__icon" aria-hidden="true">
              <History size={17} />
            </span>
            <span className="profile-link__text">
              Attendance history
              <small>Review submitted records</small>
            </span>
            <ChevronRight className="profile-link__chevron" size={17} aria-hidden="true" />
          </Link>
          <Link className="profile-link" to="/settings">
            <span className="profile-link__icon" aria-hidden="true">
              <Settings size={17} />
            </span>
            <span className="profile-link__text">
              Settings
              <small>Attendance preferences</small>
            </span>
            <ChevronRight className="profile-link__chevron" size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="profile-signout">
        <Button
          variant="outline"
          block
          icon={LogOut}
          onClick={() => setSignOutOpen(true)}
        >
          Sign out
        </Button>
      </div>

      <ConfirmSheet
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={handleSignOut}
        title="Sign out of NARSync?"
        description="Your current session state will be cleared from the app. You can sign back in with the same account."
        confirmLabel="Sign out"
        tone="danger"
        icon={LogOut}
      />
    </div>
  )
}
