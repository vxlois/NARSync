export default function StatusBadge({ children, tone = 'neutral', dot = false, className = '' }) {
  return (
    <span className={`adm-badge adm-badge--${tone} ${className}`.trim()}>
      {dot && <span className="adm-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
