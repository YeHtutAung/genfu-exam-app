import { useEffect, useRef } from 'react'
import Button from './Button'

import { useI18n } from '../../lib/i18n'

export default function Modal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = '確認', cancelLabel = 'キャンセル', danger = false }) {
  const { t } = useI18n()
  const finalConfirmLabel = confirmLabel === '確認' ? t('common.confirm') : confirmLabel
  const finalCancelLabel = cancelLabel === 'キャンセル' ? t('common.cancel') : cancelLabel
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
        <Button
          onClick={onCancel}
          variant="secondary"
          size="sm"
        >
          {finalCancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant={danger ? 'danger' : 'primary'}
          size="sm"
        >
          {finalConfirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
