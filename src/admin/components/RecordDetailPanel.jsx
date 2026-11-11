import { MapPin, ScanFace } from 'lucide-react'
import { useAdmin } from '../AdminContext'
import {
  getGroupById,
  getLocationById,
  getRecordStatus,
  getScheduleById,
  getScheduleStatus,
  getStudentById,
} from '../adminData'
import { formatCoords, formatDateLong, formatTime, formatTimestamp } from '../../utils/format'
import Avatar from './Avatar'
import StatusBadge from './StatusBadge'

export default function RecordDetailPanel({ record }) {
  const { students, groups, schedules, locations } = useAdmin()
  const student = getStudentById(students, record.studentId)
  const group = getGroupById(groups, record.groupId)
  const schedule = getScheduleById(schedules, record.scheduleId)
  const location = getLocationById(locations, record.locationId)
  const status = getRecordStatus(record)
  const scheduleStatus = schedule ? getScheduleStatus(schedule) : null

  return (
    <div className="adm-record-detail">
      <div className="adm-record-hero">
        <Avatar name={student?.name || 'Unknown student'} size="lg" />
        <div>
          <h3>{student?.name || 'Unknown student'}</h3>
          <p>
            {student?.id} · {group?.name || 'No group'}
          </p>
        </div>
        <StatusBadge tone={status.tone} dot>
          {status.label}
        </StatusBadge>
      </div>

      <div className="adm-detail-grid">
        <div>
          <span>Date</span>
          <strong>{formatDateLong(record.date)}</strong>
        </div>
        <div>
          <span>In</span>
          <strong>{formatTime(record.timeIn)}</strong>
        </div>
        <div>
          <span>Out</span>
          <strong>{formatTime(record.timeOut)}</strong>
        </div>
        <div>
          <span>Method</span>
          <strong>{record.method}</strong>
        </div>
        <div>
          <span>Match</span>
          <strong>{record.faceMatch.toFixed(1)}%</strong>
        </div>
        <div>
          <span>Record ID</span>
          <strong className="adm-mono">{record.id}</strong>
        </div>
      </div>

      <section className="adm-detail-section">
        <h4>
          <MapPin size={15} aria-hidden="true" /> Location
        </h4>
        <div className="adm-detail-list">
          <div>
            <span>Location</span>
            <strong>{location?.name || '—'}</strong>
          </div>
          <div>
            <span>Address</span>
            <strong>{location?.address || '—'}</strong>
          </div>
          <div>
            <span>Coordinates</span>
            <strong className="adm-mono">
              {location?.coords ? formatCoords(location.coords) : '—'}
            </strong>
          </div>
          <div>
            <span>Radius</span>
            <strong>{location?.radius ? `${location.radius} m` : '—'}</strong>
          </div>
          <div>
            <span>Shift</span>
            <strong>
              {schedule ? `${schedule.startTime} – ${schedule.endTime}` : '—'}
            </strong>
          </div>
          <div>
            <span>Schedule</span>
            <strong>{scheduleStatus?.label || '—'}</strong>
          </div>
        </div>
      </section>

      <section className="adm-detail-section">
        <h4>
          <ScanFace size={15} aria-hidden="true" /> Evidence
        </h4>
        <div className="adm-evidence">
          <div className="adm-evidence__photo" aria-hidden="true">
            <ScanFace size={28} />
<<<<<<< HEAD
            <span>Demo individual photo</span>
=======
            <span>Photo</span>
>>>>>>> a277e4d8d714899dc37ac7d1f60aba7212ca5c11
          </div>
          <div className="adm-detail-list adm-detail-list--compact">
            <div>
              <span>Submitted</span>
              <strong>{formatTimestamp(record.submittedAt)}</strong>
            </div>
            <div>
              <span>Device</span>
              <strong>{record.device}</strong>
            </div>
            <div>
              <span>Attendance status</span>
              <strong>{status.label}</strong>
            </div>
          </div>
        </div>
        <p className="adm-fineprint">Demo data.</p>
      </section>
    </div>
  )
}
