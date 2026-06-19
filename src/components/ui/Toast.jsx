import { useCallback, useMemo, useState } from 'react'
import ToastContext from './ToastContext'

const tones = {
  success: 'border-correct/30 bg-correct/10 text-correct',
  error: 'border-wrong/30 bg-wrong/10 text-wrong',
  info: 'border-primary/30 bg-primary/10 text-primary',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((message, tone = 'info') => {
    const id = crypto.randomUUID()
    setToasts(current => [...current, { id, message, tone }])
    window.setTimeout(() => removeToast(id), 3500)
  }, [removeToast])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-3 top-20 z-[80] flex w-[min(22rem,calc(100vw-1.5rem))] flex-col gap-2" aria-live="polite" aria-atomic="true">
        {toasts.map(toast => (
          <div key={toast.id} className={`rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${tones[toast.tone] ?? tones.info}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
