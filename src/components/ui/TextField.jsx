import { AlertCircle } from 'lucide-react'

export default function TextField({
  id,
  label,
  icon: Icon,
  error,
  hint,
  right,
  className = '',
  ...inputProps
}) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={`field ${className}`.trim()}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className={`input-wrap ${error ? 'input-wrap--error' : ''}`.trim()}>
        {Icon && <Icon size={18} aria-hidden="true" className="input-wrap__icon" />}
        <input
          id={id}
          className="input"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={descriptionId}
          {...inputProps}
        />
        {right}
      </div>
      {error && (
        <p className="field__message field__message--error" id={`${id}-error`}>
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="field__message" id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  )
}
