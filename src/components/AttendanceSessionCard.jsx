import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Lock,
  MapPin,
  ScanFace,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AttendanceActions from './AttendanceActions'
import GroupDutyCard from './GroupDutyCard'
import { getTimeInAccess, getTimeOutAccess } from '../utils/attendance'
import { formatDateLong, formatTime } from '../utils/format'

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
          {entry ? `${entry.locationName} · location saved` : missingText}
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

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function GroupMembers({ group }) {
  const members = group.memberNames ?? []
  if (members.length === 0) return null

  return (
    <section className="group-members" aria-labelledby="group-members-title">
      <div className="group-members__head">
        <h3 className="group-members__title" id="group-members-title">
          <Users size={16} aria-hidden="true" />
          Your group members
        </h3>
        <span className="group-members__count">
          {group.members} {group.members === 1 ? 'student' : 'students'}
        </span>
      </div>
      <ul className="group-members__list">
        {members.map((member) => (
          <li className="group-members__item" key={member}>
            <span className="group-members__avatar" aria-hidden="true">
              {initials(member)}
            </span>
            <span className="group-members__name">{member}</span>
          </li>
        ))}
      </ul>
      <p className="group-members__note">
        These are the students assigned to {group.name} with you today.
      </p>
    </section>
  )
}

function SummaryItem({ icon: Icon, label, value, detail }) {
  return (
    <div className="attendance-summary__item">
      <span className="attendance-summary__icon" aria-hidden="true">
        <Icon size={15} />
      </span>
      <span className="attendance-summary__text">
        <small>{label}</small>
        <strong>{value}</strong>
        {detail && <em>{detail}</em>}
      </span>
    </div>
  )
}

/**
 * Today's Session content. The compact variant is the clickable card on the
 * Attendance hub and opens the Attendance Details page. The full variant shows
 * the duty information, group members, and the Time In / Time Out actions.
 */
export default function AttendanceSessionCard({
  group,
  status,
  record,
  faceCompleted,
  canSubmit = false,
  lockReason = '',
  compact = false,
}) {
  const hasValidSchedule = Boolean(group.session.valid)
  const timeInAccess = getTimeInAccess(group)
  const timeOutAccess = getTimeOutAccess(group)

  if (compact) {
    return (
      <GroupDutyCard
        group={group}
        status={status}
        to="/attendance/details"
        titleId="today-session-title"
      >
        <div className="attendance-group__body attendance-group__body--summary">
          <div className="session-card__head">
            <div>
              <h3 className="attendance-group__session-title">Your duty today</h3>
              <p className="session-card__date">
                {group.session.shift} · {group.session.facility}
              </p>
            </div>
            <span className="attendance-group__open">
              View
              <ChevronRight size={14} aria-hidden="true" />
            </span>
          </div>

          <div className="attendance-summary">
            <SummaryItem
              icon={Clock3}
              label="Duty time"
              value={group.session.shift}
              detail={
                hasValidSchedule
                  ? `Arrive by ${group.session.callTime}`
                  : 'Waiting for your schedule'
              }
            />
            <SummaryItem
              icon={Users}
              label="Assigned group"
              value={group.name}
              detail={`${group.members} members`}
            />
          </div>

          <p className="attendance-group__hint">
            Tap this card to see your full duty details, group members, and
            Time In / Time Out buttons.
          </p>
        </div>
      </GroupDutyCard>
    )
  }

  return (
    <GroupDutyCard
      group={group}
      status={status}
      titleId="attendance-details-title"
    >
      <div className="attendance-group__body">
        <div className="session-card__head">
          <div>
            <h3 className="attendance-group__session-title">Today&apos;s attendance</h3>
            <p className="session-card__date">
              {hasValidSchedule
                ? 'Here is everything you need for your duty today.'
                : 'Your duty schedule is still being prepared.'}
            </p>
          </div>
        </div>

        <div className="session-details">
          <div className="session-detail">
            <span className="session-detail__icon" aria-hidden="true">
              <CalendarDays size={16} />
            </span>
            <span className="session-detail__text">
              <small>Duty date</small>
              <strong>{formatDateLong(group.session.date)}</strong>
            </span>
          </div>
          <div className="session-detail">
            <span className="session-detail__icon" aria-hidden="true">
              <Clock3 size={16} />
            </span>
            <span className="session-detail__text">
              <small>Duty time</small>
              <strong>{group.session.shift}</strong>
              <em>
                {hasValidSchedule
                  ? `Time In opens at ${timeInAccess.label} Philippine time · Arrive by ${group.session.callTime}`
                  : 'Your schedule is not ready yet.'}
              </em>
            </span>
          </div>
          <div className="session-detail">
            <span className="session-detail__icon" aria-hidden="true">
              <MapPin size={16} />
            </span>
            <span className="session-detail__text">
              <small>Where to report</small>
              <strong>{group.session.facility}</strong>
              <em>{group.session.address}</em>
            </span>
          </div>
          <div className="session-detail">
            <span className="session-detail__icon" aria-hidden="true">
              <Users size={16} />
            </span>
            <span className="session-detail__text">
              <small>Assigned group</small>
              <strong>{group.name}</strong>
              <em>
                {group.members} student nurses · {group.code}
              </em>
            </span>
          </div>
        </div>

        <GroupMembers group={group} />

        {!faceCompleted && (
          <SessionNotice
            icon={ScanFace}
            title="Add your face photos first"
            action={
              <Link className="text-link" to="/face-registration">
                Open facial registration
              </Link>
            }
          >
            You need to finish your facial registration before you can take
            attendance. Time In and Time Out stay locked until it is complete.
          </SessionNotice>
        )}

        {!hasValidSchedule && (
          <SessionNotice icon={Lock} title="Your schedule is not ready yet">
            Your group does not have a published duty schedule for today. Time In
            and Time Out will unlock once your RLE Coordinator publishes it.
          </SessionNotice>
        )}

        <div className="attendance-timeline">
          <TimelineItem
            label="Time in"
            evidence={record?.timeIn}
            missingText={
              hasValidSchedule
                ? `Opens at ${timeInAccess.label} Philippine time, 30 minutes before your duty.`
                : 'A published duty schedule is needed before you can time in.'
            }
          />
          <TimelineItem
            label="Time out"
            evidence={record?.timeOut}
            missingText={
              !hasValidSchedule
                ? 'A published duty schedule is needed before you can time out.'
                : record?.timeIn
                  ? timeOutAccess.hasSchedule
                    ? `Opens at ${timeOutAccess.label} Philippine time, when your duty ends.`
                    : 'Waiting for your duty end time.'
                  : 'Time in first, then come back when your duty ends.'
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
      </div>
    </GroupDutyCard>
  )
}
