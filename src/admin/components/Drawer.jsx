import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Drawer({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = 'md',
  labelledBy = 'adm-drawer-title',
}) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    const timer = window.setTimeout(() => closeRef.current?.focus(), 20)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(timer)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="adm-drawer-layer">
      <button
        type="button"
        className="adm-drawer-scrim"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside
        className={`adm-drawer adm-drawer--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <header className="adm-drawer__head">
          <div>
            <h2 id={labelledBy}>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            type="button"
            className="adm-icon-btn"
            onClick={onClose}
            aria-label="Close panel"
            ref={closeRef}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="adm-drawer__body">{children}</div>
        {footer && <footer className="adm-drawer__foot">{footer}</footer>}
      </aside>
    </div>,
    document.body,
  )
}
