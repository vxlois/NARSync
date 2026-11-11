import { Link } from 'react-router-dom'
import Badge from './ui/Badge'

/**
 * The student's permanent RLE group card. A student belongs to only one RLE
 * group, so this card also hosts today's attendance session.
 *
 * Pass `to` to make the whole card a link to the Group Photo Attendance page.
 */
export default function GroupDutyCard({
  group,
  status,
  children,
  to,
  className = '',
  titleId = 'assigned-group-name',
}) {
  const classes = `duty-card attendance-group ${
    to ? 'attendance-group--link' : ''
  } ${className}`.trim()

  const content = (
    <>
      <div className="duty-card__top">
        <div>
          <p className="duty-card__eyebrow">Today&apos;s Session</p>
          <h2 className="duty-card__title" id={titleId}>
            {group.name}
          </h2>
          <p className="duty-card__area">{group.session.facility}</p>
        </div>
        <Badge tone={status.tone} dot>
          {status.label}
        </Badge>
      </div>

      {children}
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        aria-label={`Open today's attendance details for ${group.name} · ${status.label}`}
      >
        {content}
      </Link>
    )
  }

  return (
    <section className={classes} aria-labelledby={titleId}>
      {content}
    </section>
  )
}
