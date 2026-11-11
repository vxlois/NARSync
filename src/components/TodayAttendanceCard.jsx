import { Check, Lock, ScanFace } from 'lucide-react'
import { Link } from 'react-router-dom'
import AttendanceActions from './AttendanceActions'
import Badge from './ui/Badge'
import { getAttendanceSnapshot, getTimeInAccess, getTimeOutAccess } from '../utils/attendance'
import { formatTime } from '../utils/format'

function timelineEntry(evidence) {
  if (!evidence) return null
  return {
    time: evidence.at ? formatTime(evidence.at) : evidence.time || 'Recorded',
    locationName: evidence.locationName || 'Assigned duty location',
  }
}

function TimelineItem({ label, evidence, missingText }) {
  const entry = timelineEntry(evidence)

  return (
    <div className="attendance-timeline__item">
      <span
        className={`attendance-timeline__dot ${entry ? 'is-done' : ''}`.trim()}
        aria-hidden="true"
      >
        {entry && <Check size={9} strokeWidth={3} />}
      </span>
      <div className="attendance-timeline__text">
        <div className="attendance-timeline__heading">
          <strong>{label}</strong>
          <span>{entry ? entry.time : 'Not yet'}</span>
        </div>
        <p className="attendance-timeline__meta">
          {entry ? entry.locationName : missingText}
        </p>
      </div>
    </div>
  )
}

function SessionNotice({ icon: Icon, title, children, action }) {
  return (
    <div className="session-notice">
      <span className="session-notice__icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div className="session-notice__body">
        <strong>{title}</strong>
        <p>{children}</p>
        {action}
      </div>
    </div>
  )
}

/**
 * The focused attendance card. It shows the attendance status, the student's
 * time in / time out submissions, and the actions needed to complete them.
 * Duty assignment details stay on the Home and Duty assignment pages so they
 * are not repeated here.
 */
export default function TodayAttendanceCard({
  group,
  record,
  faceCompleted,
  canSubmit = false,
  lockReason = '',
}) {
  const hasValidSchedule = Boolean(group.session.valid)
  const timeInAccess = getTimeInAccess(group)
  const timeOutAccess = getTimeOutAccess(group)
  const status = hasValidSchedule
    ? getAttendanceSnapshot(record)
    : {
        label: 'Schedule not ready',
        description:
          'Time in and time out will unlock once your duty schedule is published.',
        tone: 'warning',
      }

  return (
    <section className="session-card today-attendance" aria-label="Today's attendance status">
      <div className={`attendance-status attendance-status--${status.tone}`}>
        <div className="attendance-status__head">
          <span className="attendance-status__label">Status</span>
          <Badge tone={status.tone} dot>
            {status.label}
          </Badge>
        </div>
        <p>{status.description}</p>
      </div>

      {!faceCompleted && (
        <SessionNotice
          icon={ScanFace}
          title="Facial registration required"
          action={
            <Link className="text-link" to="/face-registration">
              Register face
            </Link>
          }
        >
          Complete registration to unlock Time In and Time Out.
        </SessionNotice>
      )}

      {!hasValidSchedule && (
        <SessionNotice icon={Lock} title="Schedule not ready">
          Time In and Time Out will unlock once your schedule is published.
        </SessionNotice>
      )}

      <div className="attendance-timeline">
        <TimelineItem
          label="Time in"
          evidence={record?.timeIn}
          missingText={
            hasValidSchedule
              ? `Opens at ${timeInAccess.label}, 30 minutes before duty.`
              : 'Waiting for your duty schedule.'
          }
        />
        <TimelineItem
          label="Time out"
          evidence={record?.timeOut}
          missingText={
            !hasValidSchedule
              ? 'Waiting for your duty schedule.'
              : record?.timeIn
                ? timeOutAccess.hasSchedule
                  ? `Opens at ${timeOutAccess.label}, when duty ends.`
                  : 'Waiting for your duty end time.'
                : 'Time in first to unlock Time Out.'
          }
        />
      </div>

      <hr className="divider" />

      <AttendanceActions
        record={record}
        group={group}
        groupId={group.id}
        canSubmit={canSubmit}
        lockReason={lockReason}
      />
    </section>
  )
}
