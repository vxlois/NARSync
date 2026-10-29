import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="spinner" size={18} aria-hidden="true" />
      ) : (
        Icon && <Icon size={18} aria-hidden="true" />
      )}
      <span>{children}</span>
      {IconRight && !loading && <IconRight size={18} aria-hidden="true" />}
    </button>
  )
}
