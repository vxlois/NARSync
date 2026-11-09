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

export default function AttendanceActions({
  record: recordProp,
  groupId = '',
  canSubmit = true,
  lockReason = '',
}) {
  const navigate = useNavigate()
  const { todayRecord } = useApp()

  const record = recordProp === undefined ? todayRecord : recordProp
  const groupQuery = groupId ? `?group=${encodeURIComponent(groupId)}` : ''
  const hasTimedIn = Boolean(record?.timeIn)
  const hasTimedOut = Boolean(record?.timeOut)
  const isLocked = !canSubmit

  const timeInHint = isLocked
    ? lockReason || 'Attendance is currently locked.'
    : hasTimedIn
      ? `Recorded at ${formatTime(record?.timeIn?.at)}`
      : 'Capture a group photo'
  const timeOutHint = isLocked
    ? lockReason || 'Attendance is currently locked.'
    : hasTimedOut
      ? `Recorded at ${formatTime(record?.timeOut?.at)}`
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
        disabled={isLocked || hasTimedIn}
        onClick={() => navigate(`/attendance/time-in/capture${groupQuery}`)}
      />
      <ActionCard
        title="Time Out"
        icon={LogOut}
        tone={!isLocked && hasTimedIn && !hasTimedOut ? 'ready' : 'secondary'}
        hint={timeOutHint}
        disabled={isLocked || !hasTimedIn || hasTimedOut}
        onClick={() => navigate(`/attendance/time-out/capture${groupQuery}`)}
      />
    </div>
  )
}
