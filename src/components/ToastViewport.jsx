import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const ICONS = {
  default: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertTriangle,
}

export default function ToastViewport() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.tone] || Info
        return (
          <div className={`toast toast--${toast.tone}`} key={toast.id} role="status">
            <Icon size={17} aria-hidden="true" />
            <p>{toast.message}</p>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
