export default function ProgressBar({ value = 0, tone = 'violet', label, hideLabel = false }) {
  const safeValue = Math.max(0, Math.min(100, value))
  return (
    <div className="adm-progress">
      {!hideLabel && (
        <div className="adm-progress__head">
          <span>{label || 'Progress'}</span>
          <strong>{safeValue}%</strong>
        </div>
      )}
      <div
        className="adm-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
        aria-label={label || 'Progress'}
      >
        <span className={`adm-progress__fill adm-progress__fill--${tone}`} style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  )
}
