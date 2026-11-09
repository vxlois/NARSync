import { CalendarDays, ChevronRight, Clock3 } from 'lucide-react'
import { formatDateMedium } from '../utils/format'
import Badge from './ui/Badge'

/**
 * Selectable attendance card that mirrors the Home page's compact DutyCard.
 */
export default function GroupDutyCard({ group, status, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`duty-card duty-card--compact duty-card--selectable ${
        selected ? 'is-selected' : ''
      }`.trim()}
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      aria-label={`${group.name} · ${status.label}`}
    >
      <span className="duty-card__top">
        <span>
          <span className="duty-card__eyebrow">Assigned group</span>
          <span className="duty-card__area">{group.name}</span>
        </span>
        <Badge tone={status.tone} dot>{status.label}</Badge>
      </span>

      <span className="duty-card__main">
        <span className="duty-card__title">{group.session.facility}</span>
      </span>

      <span className="duty-card__meta">
        <span>
          <CalendarDays size={15} aria-hidden="true" />
          {formatDateMedium(group.session.date)}
        </span>
        <span>
          <Clock3 size={15} aria-hidden="true" />
          {group.session.shift}
        </span>
      </span>

      <span className="duty-card__link">
        {selected ? 'Selected group' : 'View duty session'}
        <ChevronRight size={16} aria-hidden="true" />
      </span>
    </button>
  )
}
