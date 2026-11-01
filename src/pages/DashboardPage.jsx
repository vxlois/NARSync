import { useMemo } from 'react'
import {
  Activity,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flag,
  LogIn,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import DutyCard from '../components/DutyCard'
import FaceStatusCard from '../components/FaceStatusCard'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { useApp } from '../context/AppContext'
import { statusMeta } from '../utils/attendance'
import { formatDateMedium, formatTime, greeting } from '../utils/format'

function isFlagged(record) {
  return record?.flag?.status === 'Open'
}

function getLatestEvent(record) {
  if (record?.timeOut?.at) return { label: 'Time out submitted', at: record.timeOut.at }
  if (record?.timeIn?.at) return { label: 'Time in submitted', at: record.timeIn.at }
  return { label: 'Attendance not submitted', at: null }
}

export default function DashboardPage() {
  const { student, todayRecord, records, settings } = useApp()

  const latestRecord = useMemo(() => {
    if (records.length === 0) return null
    return [...records].sort((a, b) => {
      const aAt = a.timeOut?.at || a.timeIn?.at || a.date
      const bAt = b.timeOut?.at || b.timeIn?.at || b.date
      return String(bAt).localeCompare(String(aAt))
    })[0]
  }, [records])

  const latestEvent = latestRecord ? getLatestEvent(latestRecord) : null
  const latestStatus = latestRecord
    ? isFlagged(latestRecord)
      ? { label: 'Flagged for review', tone: 'warning' }
      : statusMeta(latestRecord)
    : null

  const notifications = useMemo(() => {
    const items = []

    const flaggedRecord = records.find((record) => isFlagged(record))
    if (flaggedRecord) {
      items.push({
        id: `flag-${flaggedRecord.id}`,
        icon: Flag,
        tone: 'warning',
        title: 'Attendance flagged for review',
        description: `${formatDateMedium(flaggedRecord.date)} · ${
          flaggedRecord.flag?.reason || 'Verification needed'
        }`,
        to: `/history/${flaggedRecord.id}`,
      })
    }

    if (!todayRecord?.timeIn) {
      items.push({
        id: 'time-in-reminder',
        icon: LogIn,
        tone: 'violet',
        title: 'Time in for today’s duty',
        description: `Submit a group photo at ${student.duty.facility} to start your attendance.`,
        to: '/attendance',
      })
    } else if (!todayRecord.timeOut) {
      items.push({
        id: 'time-in-recorded',
        icon: Clock3,
        tone: 'violet',
        title: 'Time in recorded',
        description: `${formatTime(todayRecord.timeIn.at)} · Remember to time out after your shift.`,
        to: '/attendance',
      })
    } else {
      items.push({
        id: 'attendance-complete',
        icon: CheckCircle2,
        tone: 'success',
        title: 'Attendance complete for today',
        description: `Time out recorded at ${formatTime(todayRecord.timeOut.at)}.`,
        to: `/history/${todayRecord.id}`,
      })
    }

    if (settings.reminders) {
      items.push({
        id: 'duty-reminder',
        icon: CalendarDays,
        tone: 'neutral',
        title: `Duty call time ${student.duty.callTime}`,
        description: `${student.duty.shift} · ${student.duty.facility}`,
        to: '/duty',
      })
    }

    return items.slice(0, 3)
  }, [records, settings.reminders, student.duty, todayRecord])

  return (
    <div className="screen dashboard">
      <header className="dashboard-head">
        <div className="dashboard-head__copy">
          <p className="eyebrow">{greeting()}</p>
          <h1>Welcome back</h1>
          <p className="dashboard-head__sub">
            {student.section}
          </p>
        </div>
        <Link className="avatar-link" to="/profile" aria-label="Open student profile">
          {student.initials}
        </Link>
      </header>

      <DutyCard compact />

      <section className="section" aria-labelledby="notifications-title">
        <div className="section__head">
          <h2 className="section__title" id="notifications-title">
            Notifications
          </h2>
          <span className="count-pill">
            {notifications.length} {notifications.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {notifications.length > 0 ? (
          <div className="dashboard-list">
            {notifications.map((notification) => {
              const Icon = notification.icon
              return (
                <Link
                  className="notification-item"
                  key={notification.id}
                  to={notification.to}
                >
                  <span
                    className={`notification-item__icon notification-item__icon--${notification.tone}`}
                    aria-hidden="true"
                  >
                    <Icon size={17} />
                  </span>
                  <span className="notification-item__body">
                    <span className="notification-item__title">{notification.title}</span>
                    <span className="notification-item__description">
                      {notification.description}
                    </span>
                  </span>
                  <ChevronRight
                    className="notification-item__chevron"
                    size={16}
                    aria-hidden="true"
                  />
                </Link>
              )
            })}
          </div>
        ) : (
          <EmptyState
            compact
            icon={Bell}
            title="No new notifications"
            description="Duty reminders and attendance updates will appear here."
          />
        )}
      </section>

      <section className="section" aria-labelledby="recent-activity-title">
        <div className="section__head">
          <h2 className="section__title" id="recent-activity-title">
            Recent activity
          </h2>
          {latestRecord && (
            <Link className="section__link" to="/history">
              View all
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>

        {latestRecord ? (
          <Link className="activity-card" to={`/history/${latestRecord.id}`}>
            <span className="activity-card__icon" aria-hidden="true">
              <Activity size={19} />
            </span>
            <span className="activity-card__body">
              <span className="activity-card__title">{latestEvent.label}</span>
              <span className="activity-card__meta">
                {latestRecord.duty?.facility || 'Clinical duty'} ·{' '}
                {formatDateMedium(latestRecord.date)}
              </span>
              {latestEvent.at && (
                <span className="activity-card__time">{formatTime(latestEvent.at)}</span>
              )}
            </span>
            <span className="activity-card__end">
              <Badge tone={latestStatus.tone}>{latestStatus.label}</Badge>
              <ChevronRight size={17} aria-hidden="true" />
            </span>
          </Link>
        ) : (
          <EmptyState
            compact
            icon={Activity}
            title="No recent activity"
            description="Your latest attendance submission will appear here after you time in."
          />
        )}
      </section>

      <FaceStatusCard />
    </div>
  )
}
