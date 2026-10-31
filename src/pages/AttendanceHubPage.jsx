import { Check, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import AttendanceActions from '../components/AttendanceActions'
import DutyCard from '../components/DutyCard'
import RecordCard from '../components/RecordCard'
import Badge from '../components/ui/Badge'
import { useApp } from '../context/AppContext'
import { getAttendanceSnapshot } from '../utils/attendance'
import { formatDateLong, formatTime } from '../utils/format'

function TimelineItem({ label, evidence, missingText }) {
  return (
    <div className="attendance-timeline__item">
      <span className={`attendance-timeline__dot ${evidence ? 'is-done' : ''}`.trim()} aria-hidden="true">
        {evidence && <Check size={9} strokeWidth={3} />}
      </span>
      <div className="attendance-timeline__text">
        <div className="attendance-timeline__heading">
          <strong>{label}</strong>
          <span>{evidence ? formatTime(evidence.at) : 'Not recorded'}</span>
        </div>
        <p className="attendance-timeline__meta">
          {evidence ? `${evidence.locationName} · GPS` : missingText}
        </p>
      </div>
    </div>
  )
}

export default function AttendanceHubPage() {
  const { student, todayRecord, records } = useApp()
  const snapshot = getAttendanceSnapshot(todayRecord)
  const recent = records.filter((record) => record.date !== student.duty.date).slice(0, 2)

  return (
    <div className="screen">
      <header className="tab-header">
        <div>
          <h1>Attendance</h1>
          <p>{formatDateLong(student.duty.date)}</p>
        </div>
        <Badge tone={snapshot.tone}>{snapshot.label}</Badge>
      </header>

      <DutyCard link={false} />

      <section className="session-card" aria-labelledby="session-title">
        <div className="session-card__head">
          <div>
            <p className="eyebrow">Today&apos;s session</p>
            <h2 id="session-title">Group photo attendance</h2>
            <p className="session-card__date">
              {student.duty.shift} · {student.duty.facility}
            </p>
          </div>
        </div>

        <div className="attendance-timeline">
          <TimelineItem
            label="Time in"
            evidence={todayRecord?.timeIn}
            missingText="Capture a group photo to start your duty."
          />
          <TimelineItem
            label="Time out"
            evidence={todayRecord?.timeOut}
            missingText={
              todayRecord?.timeIn
                ? 'Available now that your time in is recorded.'
                : 'Requires a valid time in for this duty day.'
            }
          />
        </div>

        <hr className="divider" />

        <AttendanceActions />
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
