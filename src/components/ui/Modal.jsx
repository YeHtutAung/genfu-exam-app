import { useEffect, useRef } from 'react'

export default function Modal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = '確認', cancelLabel = 'キャンセル', danger = false }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-full max-w-sm rounded-2xl bg-bg p-6 shadow-xl backdrop:bg-black/50 border border-theme-border"
      onClose={onCancel}
    >
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      <p className="mt-2 text-sm text-text-secondary">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-xl bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-theme-border"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors ${
            danger
              ? 'bg-wrong hover:bg-red-700'
              : 'bg-primary hover:bg-primary-hover'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
