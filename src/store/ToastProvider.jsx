/* eslint-disable react/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (message, options = {}) => {
      const id = ++toastId
      const { type = 'info', title, duration = 4200, action } = options
      setToasts((current) => [...current, { id, message, type, title, action }])
      if (duration !== Infinity) {
        setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss],
  )

  const api = useMemo(
    () => ({
      toasts,
      push,
      dismiss,
      success: (message, options) => push(message, { ...options, type: 'success' }),
      error: (message, options) => push(message, { ...options, type: 'danger' }),
      warning: (message, options) => push(message, { ...options, type: 'warning' }),
      info: (message, options) => push(message, { ...options, type: 'info' }),
    }),
    [toasts, push, dismiss],
  )

  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>
}

export function useToast() {
  return useContext(ToastContext)
}
