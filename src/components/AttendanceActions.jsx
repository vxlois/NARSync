import { ArrowRight, Lock, LogIn, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatTime } from '../utils/format'

function ActionCard({ title, icon: Icon, disabled, hint, onClick, tone }) {
  return (
    <button
      type="button"
      className={`action-card action-card--${tone} ${disabled ? 'is-disabled' : ''}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="action-card__top">
        <span className="action-card__icon">
          <Icon size={21} aria-hidden="true" />
        </span>
        {disabled ? (
          <Lock size={16} className="action-card__arrow" aria-hidden="true" />
        ) : (
          <ArrowRight size={17} className="action-card__arrow" aria-hidden="true" />
        )}
      </span>
      <span>
        <span className="action-card__title">{title}</span>
        <span className="action-card__hint">{hint}</span>
      </span>
    </button>
  )
}

export default function AttendanceActions() {
  const navigate = useNavigate()
  const { todayRecord, hasTimedIn, hasTimedOut } = useApp()

  const timeInHint = hasTimedIn
    ? `Recorded at ${formatTime(todayRecord?.timeIn?.at)}`
    : 'Capture a group photo'
  const timeOutHint = hasTimedOut
    ? `Recorded at ${formatTime(todayRecord?.timeOut?.at)}`
    : hasTimedIn
      ? 'Capture your group photo'
      : 'Available after a valid time in'

  return (
    <div className="attendance-actions" aria-label="Attendance actions">
      <ActionCard
        title="Time In"
        icon={LogIn}
        tone="primary"
        hint={timeInHint}
        disabled={hasTimedIn}
        onClick={() => navigate('/attendance/time-in/capture')}
      />
      <ActionCard
        title="Time Out"
        icon={LogOut}
        tone={hasTimedIn && !hasTimedOut ? 'ready' : 'secondary'}
        hint={timeOutHint}
        disabled={!hasTimedIn || hasTimedOut}
        onClick={() => navigate('/attendance/time-out/capture')}
      />
    </div>
  )
}
