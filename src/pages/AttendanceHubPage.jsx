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
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AttendanceActions from '../components/AttendanceActions'
import GroupDutyCard from '../components/GroupDutyCard'
import RecordCard from '../components/RecordCard'
import Badge from '../components/ui/Badge'
import { useApp } from '../context/AppContext'
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
      <span className={`attendance-timeline__dot ${entry ? 'is-done' : ''}`.trim()} aria-hidden="true">
        {entry && <Check size={9} strokeWidth={3} />}
      </span>
      <div className="attendance-timeline__text">
        <div className="attendance-timeline__heading">
          <strong>{label}</strong>
          <span>{entry ? entry.time : 'Not recorded'}</span>
        </div>
        <p className="attendance-timeline__meta">
          {entry ? `${entry.locationName} · GPS` : missingText}
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

function groupStatus(group, record) {
  if (!group.session.valid) {
    return { key: 'planning', label: 'Schedule Planning', tone: 'warning' }
  }
  if (record?.timeOut) {
    return { key: 'completed', label: 'Duty Completed', tone: 'success' }
  }
  return { key: 'on-duty', label: 'On Duty', tone: 'violet' }
}

export default function AttendanceHubPage() {
  const { student, records, faceCompleted, getTodayRecord } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedGroupId = searchParams.get('group')
  const initialGroup =
    student.groups.find((group) => group.id === requestedGroupId) ??
    student.groups.find((group) => group.id === student.group.id) ??
    student.groups[0]
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroup.id)

  const selectedGroup =
    student.groups.find((group) => group.id === selectedGroupId) ?? initialGroup
  const hasValidSchedule = Boolean(selectedGroup.session.valid)
  const sessionRecord = getTodayRecord(selectedGroup.id)
  const selectedStatus = groupStatus(selectedGroup, sessionRecord)

  const recent = records
    .filter(
      (record) =>
        record.date !== student.duty.date &&
        (record.groupId || student.group.id) === student.group.id,
    )
    .slice(0, 2)

  const canSubmit = hasValidSchedule && faceCompleted
  const lockReason = !hasValidSchedule
    ? 'This group is still in schedule planning. Time In and Time Out are locked until the duty schedule is published.'
    : !faceCompleted
      ? 'Complete facial registration before submitting attendance.'
      : ''

  const selectGroup = (groupId) => {
    setSelectedGroupId(groupId)
    setSearchParams({ group: groupId }, { replace: true })
  }

  return (
    <div className="screen">
      <header className="tab-header">
        <div>
          <h1>Attendance</h1>
          <p>{formatDateLong(student.duty.date)}</p>
        </div>
        <Badge tone={selectedStatus.tone}>{selectedStatus.label}</Badge>
      </header>

      <section className="section" aria-labelledby="group-picker-title">
        <div className="section__head">
          <h2 className="section__title" id="group-picker-title">
            Assigned groups
          </h2>
          <span className="muted small">Select a group</span>
        </div>
        <div className="group-picker" role="radiogroup" aria-label="Select an assigned RLE group">
          {student.groups.map((group) => (
            <GroupDutyCard
              key={group.id}
              group={group}
              status={groupStatus(group, getTodayRecord(group.id))}
              selected={group.id === selectedGroup.id}
              onSelect={() => selectGroup(group.id)}
            />
          ))}
        </div>
      </section>

      <section className="session-card" aria-labelledby="session-title">
        <div className="session-card__head">
          <div>
            <p className="eyebrow">Today&apos;s session · {selectedGroup.name}</p>
            <h2 id="session-title">Group photo attendance</h2>
            <p className="session-card__date">
              {selectedGroup.session.shift} · {selectedGroup.session.facility}
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
              <strong>{formatDateLong(selectedGroup.session.date)}</strong>
            </span>
          </div>
          <div className="session-detail">
            <span className="session-detail__icon" aria-hidden="true">
              <Clock3 size={16} />
            </span>
            <span className="session-detail__text">
              <small>Duty schedule</small>
              <strong>{selectedGroup.session.shift}</strong>
              <em>Call time {selectedGroup.session.callTime}</em>
            </span>
          </div>
          <div className="session-detail">
            <span className="session-detail__icon" aria-hidden="true">
              <MapPin size={16} />
            </span>
            <span className="session-detail__text">
              <small>Duty location</small>
              <strong>{selectedGroup.session.facility}</strong>
              <em>{selectedGroup.session.address}</em>
            </span>
          </div>
          <div className="session-detail">
            <span className="session-detail__icon" aria-hidden="true">
              <Users size={16} />
            </span>
            <span className="session-detail__text">
              <small>Clinical area</small>
              <strong>{selectedGroup.clinicalArea}</strong>
              <em>{selectedGroup.members} student nurses · {selectedGroup.code}</em>
            </span>
          </div>
        </div>

        {!hasValidSchedule && (
          <SessionNotice icon={Lock} title="Schedule planning in progress">
            This group does not have a published duty schedule for today. Time In and
            Time Out become available once the RLE Coordinator publishes the schedule.
          </SessionNotice>
        )}

        {hasValidSchedule && !faceCompleted && (
          <SessionNotice
            icon={ScanFace}
            title="Facial registration required"
            action={
              <Link className="text-link" to="/face-registration">
                Complete facial registration
              </Link>
            }
          >
            Face registration must be completed before attendance can be submitted. Time In
            and Time Out stay locked until your facial registration is complete.
          </SessionNotice>
        )}

        <div className="attendance-timeline">
          <TimelineItem
            label="Time in"
            evidence={sessionRecord?.timeIn}
            missingText={
              hasValidSchedule
                ? 'Capture a group photo to start your duty.'
                : 'A published duty schedule is required before attendance.'
            }
          />
          <TimelineItem
            label="Time out"
            evidence={sessionRecord?.timeOut}
            missingText={
              !hasValidSchedule
                ? 'A published duty schedule is required before attendance.'
                : sessionRecord?.timeIn
                  ? 'Available now that your time in is recorded.'
                  : 'Requires a valid time in for this duty day.'
            }
          />
        </div>

        <hr className="divider" />

        <AttendanceActions
          record={sessionRecord}
          groupId={selectedGroup.id}
          canSubmit={canSubmit}
          lockReason={lockReason}
        />
      </section>

      <section className="section" aria-labelledby="how-it-works-title">
        <div className="section__head">
          <h2 className="section__title" id="how-it-works-title">
            How attendance works
          </h2>
        </div>
        <div className="how-it-works">
          <div className="how-it-works__step">
            <span className="how-it-works__num" aria-hidden="true">1</span>
            <div className="how-it-works__text">
              <strong>Capture a group photo</strong>
              <p>The whole assigned group must be visible in the camera frame.</p>
            </div>
          </div>
          <div className="how-it-works__step">
            <span className="how-it-works__num" aria-hidden="true">2</span>
            <div className="how-it-works__text">
              <strong>Review the evidence</strong>
              <p>Check the timestamp, retrieved location, and assigned duty location.</p>
            </div>
          </div>
          <div className="how-it-works__step">
            <span className="how-it-works__num" aria-hidden="true">3</span>
            <div className="how-it-works__text">
              <strong>Confirm the submission</strong>
              <p>Your dashboard and history update after the submission succeeds.</p>
            </div>
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="section" aria-labelledby="recent-attendance-title">
          <div className="section__head">
            <h2 className="section__title" id="recent-attendance-title">
              Recent attendance
            </h2>
            <Link className="section__link" to="/history">
              View all
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="record-list">
            {recent.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
