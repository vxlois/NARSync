export default function Badge({ children, tone = 'neutral', className = '', dot = false }) {
  return (
    <span className={`badge badge--${tone} ${className}`.trim()}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
