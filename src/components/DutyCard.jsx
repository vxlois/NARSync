import { CalendarDays, ChevronRight, Clock3, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatDateMedium } from '../utils/format'
import Badge from './ui/Badge'

export default function DutyCard({ link = true, className = '', compact = false }) {
  const { student } = useApp()
  const { duty, group } = student

  return (
    <section
      className={`duty-card ${compact ? 'duty-card--compact' : ''} ${className}`.trim()}
      aria-label="Today's assigned duty"
    >
      <div className="duty-card__top">
        <div>
          <p className="duty-card__eyebrow">
            {compact ? "Today's duty" : "Today's assigned duty"}
          </p>
          {!compact && <p className="duty-card__area">{duty.clinicalArea}</p>}
        </div>
        <Badge tone="light">{group.name}</Badge>
      </div>

      <div className="duty-card__main">
        <h2>{duty.facility}</h2>
        {!compact && (
          <p className="duty-card__address">
            <MapPin size={14} aria-hidden="true" />
            {duty.address}
          </p>
        )}
      </div>

      <div className="duty-card__meta">
        <span>
          <CalendarDays size={15} aria-hidden="true" />
          {formatDateMedium(duty.date)}
        </span>
        <span>
          <Clock3 size={15} aria-hidden="true" />
          {duty.shift}
        </span>
      </div>

      {link && (
        <Link className="duty-card__link" to="/duty">
          View duty details
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      )}
    </section>
  )
}
