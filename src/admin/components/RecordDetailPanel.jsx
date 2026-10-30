import { AlertTriangle, CheckCircle2, MapPin, ScanFace } from 'lucide-react'
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
          <span>Duty date</span>
          <strong>{formatDateLong(record.date)}</strong>
        </div>
        <div>
          <span>Time in</span>
          <strong>{formatTime(record.timeIn)}</strong>
        </div>
        <div>
          <span>Time out</span>
          <strong>{formatTime(record.timeOut)}</strong>
        </div>
        <div>
          <span>Capture method</span>
          <strong>{record.method}</strong>
        </div>
        <div>
          <span>Face match</span>
          <strong>{record.faceMatch.toFixed(1)}%</strong>
        </div>
        <div>
          <span>Attendance ID</span>
          <strong className="adm-mono">{record.id}</strong>
        </div>
      </div>

      {record.flag && (
        <div
          className={`adm-flag-card ${
            record.flag.status === 'Open' ? 'adm-flag-card--open' : 'adm-flag-card--resolved'
          }`}
        >
          <div className="adm-flag-card__head">
            <span className="adm-flag-card__icon" aria-hidden="true">
              {record.flag.status === 'Open' ? (
                <AlertTriangle size={17} />
              ) : (
                <CheckCircle2 size={17} />
              )}
            </span>
            <div>
              <strong>{record.flag.reason}</strong>
              <p>Raised by {record.flag.raisedBy} · {formatTimestamp(record.flag.raisedAt)}</p>
            </div>
            <StatusBadge tone={record.flag.status === 'Open' ? 'danger' : 'success'}>
              {record.flag.status}
            </StatusBadge>
          </div>
          <p className="adm-flag-card__detail">{record.flag.detail}</p>
          {record.flag.status === 'Resolved' && (
            <div className="adm-flag-resolution">
              <span>Resolution</span>
              <p>{record.flag.resolution}</p>
              <small>
                {record.flag.resolvedBy} · {formatTimestamp(record.flag.resolvedAt)}
              </small>
            </div>
          )}
        </div>
      )}

      <section className="adm-detail-section">
        <h4>
          <MapPin size={15} aria-hidden="true" /> Duty & location
        </h4>
        <div className="adm-detail-list">
          <div>
            <span>Clinical location</span>
            <strong>{location?.name || 'Location not recorded'}</strong>
          </div>
          <div>
            <span>Address</span>
            <strong>{location?.address || 'Not available'}</strong>
          </div>
          <div>
            <span>Coordinates</span>
            <strong className="adm-mono">
              {location?.coords ? formatCoords(location.coords) : 'Not configured'}
            </strong>
          </div>
          <div>
            <span>Verification radius</span>
            <strong>{location?.radius ? `${location.radius} m` : 'Not configured'}</strong>
          </div>
          <div>
            <span>Scheduled shift</span>
            <strong>
              {schedule ? `${schedule.startTime} – ${schedule.endTime}` : 'Schedule not linked'}
            </strong>
          </div>
          <div>
            <span>Schedule status</span>
            <strong>{scheduleStatus?.label || 'Not available'}</strong>
          </div>
        </div>
      </section>

      <section className="adm-detail-section">
        <h4>
          <ScanFace size={15} aria-hidden="true" /> Capture evidence
        </h4>
        <div className="adm-evidence">
          <div className="adm-evidence__photo" aria-hidden="true">
            <ScanFace size={28} />
            <span>Demo group photo</span>
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
              <span>Review state</span>
              <strong>{record.flag ? record.flag.status : 'No flag raised'}</strong>
            </div>
          </div>
        </div>
        <p className="adm-fineprint">
          Facial match, coordinates, and capture evidence are fictional prototype values.
        </p>
      </section>
    </div>
  )
}
