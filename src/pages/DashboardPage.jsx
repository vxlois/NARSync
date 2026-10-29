import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import AttendanceActions from '../components/AttendanceActions'
import DutyCard from '../components/DutyCard'
import FaceStatusCard from '../components/FaceStatusCard'
import DemoNotice from '../components/DemoNotice'
import { useApp } from '../context/AppContext'
import { getAttendanceSnapshot } from '../utils/attendance'
import { formatTime, greeting } from '../utils/format'

export default function DashboardPage() {
  const { student, todayRecord } = useApp()
  const snapshot = getAttendanceSnapshot(todayRecord)

  return (
    <div className="screen dashboard">
      <header className="dashboard-head">
        <div className="dashboard-head__copy">
          <p className="eyebrow">{greeting()}</p>
          <h1>{student.name}</h1>
          <p className="dashboard-head__sub">
            {student.section} · {student.group.name}
          </p>
        </div>
        <Link className="avatar-link" to="/profile" aria-label="Open student profile">
          {student.initials}
        </Link>
      </header>

      <DutyCard />

      <section className="section" aria-labelledby="attendance-status-title">
        <div className="section__head">
          <h2 className="section__title" id="attendance-status-title">
            Today&apos;s attendance
          </h2>
          <Link className="section__link" to="/attendance">
            Open
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className={`day-status day-status--${snapshot.tone}`}>
          <div className="day-status__top">
            <span className="day-status__label">
              <span
                className={`status-dot ${snapshot.tone !== 'neutral' ? `status-dot--${snapshot.tone}` : ''}`.trim()}
                aria-hidden="true"
              />
              {snapshot.label}
            </span>
            <span className="day-status__times">
              In {formatTime(todayRecord?.timeIn?.at)} · Out{' '}
              {formatTime(todayRecord?.timeOut?.at)}
            </span>
          </div>
          <p className="day-status__description">{snapshot.description}</p>
        </div>
      </section>

      <AttendanceActions />

      <FaceStatusCard />

      <DemoNotice>
        <strong>Prototype mode.</strong> Facial registration, camera capture, GPS, and
        timestamps are simulated. Nothing is sent to a server or stored permanently.
      </DemoNotice>
    </div>
  )
}
