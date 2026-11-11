import { useEffect, useState } from 'react'
import { ArrowRight, Clock3, Lock, LogIn, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatCountdown, getTimeInAccess, getTimeOutAccess } from '../utils/attendance'
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
  group: groupProp,
  groupId = '',
  canSubmit = true,
  lockReason = '',
  variant = 'cards',
}) {
  const navigate = useNavigate()
  const { todayRecord, student } = useApp()
  const [now, setNow] = useState(() => Date.now())

  const record = recordProp === undefined ? todayRecord : recordProp
  const group =
    groupProp ??
    student.groups.find((item) => item.id === groupId) ??
    student.groups[0]
  const groupQuery = group?.id ? `?group=${encodeURIComponent(group.id)}` : ''
  const hasTimedIn = Boolean(record?.timeIn)
  const hasTimedOut = Boolean(record?.timeOut)
  const isLocked = !canSubmit

  const timeInAccess = getTimeInAccess(group, now)
  const timeOutAccess = getTimeOutAccess(group, now)
  const isWaitingForTimeIn =
    !hasTimedIn && timeInAccess.hasSchedule && !timeInAccess.isOpen
  const timeInBlockedBySchedule =
    !hasTimedIn && (!timeInAccess.hasSchedule || isWaitingForTimeIn)
  const isWaitingForTimeOut =
    hasTimedIn && !hasTimedOut && timeOutAccess.hasSchedule && !timeOutAccess.isOpen
  const timeOutBlockedBySchedule =
    hasTimedIn &&
    !hasTimedOut &&
    (!timeOutAccess.hasSchedule || isWaitingForTimeOut)

  useEffect(() => {
    if (!isWaitingForTimeIn && !isWaitingForTimeOut) return undefined
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [isWaitingForTimeIn, isWaitingForTimeOut])

  const timeInHint = (() => {
    if (isLocked) return lockReason || 'Attendance is currently locked.'
    if (hasTimedIn) return `Recorded at ${formatTime(record?.timeIn?.at)}`
    if (!timeInAccess.hasSchedule) return 'Duty time not set'
    if (timeInBlockedBySchedule) {
      return `Opens at ${timeInAccess.label} · ${formatCountdown(
        timeInAccess.remainingMs,
      )} to go`
    }
    return 'Take your photo to time in'
  })()
  const timeOutHint = (() => {
    if (isLocked) return lockReason || 'Attendance is currently locked.'
    if (hasTimedOut) return `Recorded at ${formatTime(record?.timeOut?.at)}`
    if (!hasTimedIn) return 'Time in first to unlock'
    if (!timeOutAccess.hasSchedule) {
      return 'Waiting for your duty end time'
    }
    if (timeOutBlockedBySchedule) {
      return `Opens at ${timeOutAccess.label} · ${formatCountdown(
        timeOutAccess.remainingMs,
      )} to go`
    }
    return 'Take your photo to time out'
  })()

  const timeInDisabled = isLocked || hasTimedIn || timeInBlockedBySchedule
  const timeOutDisabled =
    isLocked || !hasTimedIn || hasTimedOut || timeOutBlockedBySchedule

  if (variant === 'dock') {
    return (
      <div className="attendance-action-row" aria-label="Attendance actions">
        <button
          type="button"
          className="attendance-action-button"
          onClick={() => navigate(`/attendance/time-in/capture${groupQuery}`)}
          disabled={timeInDisabled}
        >
          <span>Time In</span>
          {timeInDisabled ? (
            <Lock size={16} aria-hidden="true" />
          ) : (
            <LogIn size={16} aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className="attendance-action-button"
          onClick={() => navigate(`/attendance/time-out/capture${groupQuery}`)}
          disabled={timeOutDisabled}
        >
          <span>Time Out</span>
          {timeOutDisabled ? (
            <Lock size={16} aria-hidden="true" />
          ) : (
            <LogOut size={16} aria-hidden="true" />
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="attendance-actions" aria-label="Attendance actions">
      <ActionCard
        title="Time In"
        icon={LogIn}
        tone="primary"
        hint={timeInHint}
        disabled={timeInDisabled}
        onClick={() => navigate(`/attendance/time-in/capture${groupQuery}`)}
      />
      <ActionCard
        title="Time Out"
        icon={LogOut}
        tone={
          !isLocked && hasTimedIn && !hasTimedOut && !timeOutBlockedBySchedule
            ? 'ready'
            : 'secondary'
        }
        hint={timeOutHint}
        disabled={timeOutDisabled}
        onClick={() => navigate(`/attendance/time-out/capture${groupQuery}`)}
      />
      {timeInBlockedBySchedule && (
        <p className="attendance-actions__schedule-note">
          <Clock3 size={13} aria-hidden="true" />
          {timeInAccess.hasSchedule ? (
            <>
              Time In opens at <strong>{timeInAccess.label}</strong>, 30 minutes
              before duty.
            </>
          ) : (
            <>Time In opens once your schedule is published.</>
          )}
        </p>
      )}
      {timeOutBlockedBySchedule && (
        <p className="attendance-actions__schedule-note">
          <Clock3 size={13} aria-hidden="true" />
          {timeOutAccess.hasSchedule ? (
            <>
              Time Out opens at <strong>{timeOutAccess.label}</strong>, when duty
              ends.
            </>
          ) : (
            <>Time Out opens once your duty end time is published.</>
          )}
        </p>
      )}
    </div>
  )
}
