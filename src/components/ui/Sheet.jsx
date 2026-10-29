import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, CheckCircle2, Info, ShieldQuestion, X } from 'lucide-react'
import Button from './Button'

const ICONS = {
  primary: ShieldQuestion,
  danger: AlertTriangle,
  success: CheckCircle2,
  violet: Info,
}

export default function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  icon,
  tone = 'primary',
  dismissible = true,
}) {
  const titleId = useId()
  const descriptionId = useId()
  const sheetRef = useRef(null)
  const lastFocused = useRef(null)
  const closeRef = useRef(onClose)
  const dismissibleRef = useRef(dismissible)
  const Icon = icon || ICONS[tone] || Info

  useEffect(() => {
    closeRef.current = onClose
    dismissibleRef.current = dismissible
  }, [onClose, dismissible])

  useEffect(() => {
    if (!open) return undefined
    lastFocused.current = document.activeElement
    const focusTimer = window.setTimeout(() => sheetRef.current?.focus(), 30)
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && dismissibleRef.current) closeRef.current?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKeyDown)
      if (lastFocused.current instanceof HTMLElement) lastFocused.current.focus()
    }
  }, [open])

  if (!open) return null
  const container = document.getElementById('app-root') || document.body

  return createPortal(
    <div
      className="sheet-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && dismissible) onClose?.()
      }}
    >
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        ref={sheetRef}
      >
        <div className="sheet__handle" aria-hidden="true" />
        {dismissible && (
          <button className="sheet__close" type="button" onClick={onClose} aria-label="Close dialog">
            <X size={18} aria-hidden="true" />
          </button>
        )}
        <div className={`confirm__icon confirm__icon--${tone}`} aria-hidden="true">
          <Icon size={22} />
        </div>
        <h2 className="sheet__title" id={titleId}>
          {title}
        </h2>
        {description && (
          <p className="sheet__description" id={descriptionId}>
            {description}
          </p>
        )}
        {children && <div className="sheet__content">{children}</div>}
        {footer && <div className="sheet__footer">{footer}</div>}
      </div>
    </div>,
    container,
  )
}

export function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  tone = 'primary',
  icon,
  children,
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      tone={tone}
      icon={icon}
      dismissible={!loading}
      footer={
        <div className="sheet__actions">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {children}
    </Sheet>
  )
}
