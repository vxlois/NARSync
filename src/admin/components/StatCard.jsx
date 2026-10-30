import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export default function StatCard({
  icon: Icon,
  label,
  value,
  note,
  tone = 'violet',
  trend,
  to,
  onClick,
  hint,
}) {
  const interactive = Boolean(to || onClick)
  const className = `adm-stat adm-stat--${tone}${interactive ? ' adm-stat--interactive' : ''}`
  const accessibleLabel = hint
    ? `${hint}. ${label}: ${value}.`
    : `${label}: ${value}. Open filtered view.`

  const content = (
    <>
      <div className="adm-stat__top">
        <span className="adm-stat__icon" aria-hidden="true">
          {Icon && <Icon size={18} />}
        </span>
        <span className="adm-stat__top-end">
          {trend && <span className="adm-stat__trend">{trend}</span>}
          {interactive && (
            <span className="adm-stat__go" aria-hidden="true">
              <ArrowUpRight size={14} />
            </span>
          )}
        </span>
      </div>
      <p className="adm-stat__label">{label}</p>
      <p className="adm-stat__value">{value}</p>
      {note && <p className="adm-stat__note">{note}</p>}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={className} aria-label={accessibleLabel}>
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick} aria-label={accessibleLabel}>
        {content}
      </button>
    )
  }

  return <article className={className}>{content}</article>
}
