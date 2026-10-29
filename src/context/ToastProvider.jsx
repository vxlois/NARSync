import { useCallback, useEffect, useRef, useState } from 'react'
import { ToastContext } from './ToastContext'

let nextId = 1

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (message, tone = 'default') => {
      const id = nextId++
      setToasts((current) => [...current.slice(-2), { id, message, tone }])
      const timer = window.setTimeout(() => dismiss(id), 3600)
      timers.current.set(id, timer)
      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}
