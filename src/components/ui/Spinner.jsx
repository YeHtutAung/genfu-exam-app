import { useI18n } from '../../lib/i18n'

export default function Spinner({ size = 'h-8 w-8' }) {
  const { t } = useI18n()

  return (
    <div
      className={`${size} animate-spin rounded-full border-4 border-theme-border border-t-primary`}
      role="status"
    >
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  )
}
