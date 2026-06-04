"use client"

import { createContext, useCallback, useContext, useRef, useState } from "react"
import { CheckCircle2, Info, X, XCircle } from "lucide-react"

type ToastVariant = "success" | "error" | "info"

type ToastItem = {
  id: number
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  notify: (message: string, variant?: ToastVariant) => void
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const AUTO_DISMISS_MS = 4500

const ICONS: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = (idRef.current += 1)
      setToasts((prev) => [...prev, { id, message, variant }])
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss]
  )

  const success = useCallback((message: string) => notify(message, "success"), [notify])
  const error = useCallback((message: string) => notify(message, "error"), [notify])

  return (
    <ToastContext.Provider value={{ notify, success, error }}>
      {children}
      <div className="toast-viewport" role="region" aria-label="Notifications">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.variant]
          return (
            <div key={toast.id} className={`toast toast-${toast.variant}`} role="status">
              <Icon className="toast-icon" />
              <span className="toast-msg">{toast.message}</span>
              <button
                type="button"
                className="toast-x"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
              >
                <X />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return ctx
}
