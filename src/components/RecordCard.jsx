import { ChevronRight, LogIn, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDayParts, formatTime } from '../utils/format'
import StatusPill from './StatusPill'

export default function RecordCard({ record, showTimes = true }) {
  const day = formatDayParts(record.date)

  return (
    <Link className="record-card" to={`/history/${record.id}`}>
      <div className="record-card__date" aria-hidden="true">
        <span className="record-card__day">{day.day}</span>
        <span className="record-card__month">{day.month}</span>
      </div>
      <div className="record-card__body">
        <div className="record-card__heading">
          <div>
            <p className="record-card__weekday">{day.weekday}</p>
            <h3>{record.duty?.facility || 'Clinical duty'}</h3>
          </div>
          <StatusPill record={record} />
        </div>
        {showTimes && (
          <div className="record-card__times">
            <span>
              <LogIn size={14} aria-hidden="true" />
              {record.timeIn ? formatTime(record.timeIn.at) : 'No time in'}
            </span>
            <span>
              <LogOut size={14} aria-hidden="true" />
              {record.timeOut ? formatTime(record.timeOut.at) : 'No time out'}
            </span>
          </div>
        )}
      </div>
      <ChevronRight className="record-card__chevron" size={18} aria-hidden="true" />
    </Link>
  )
}
