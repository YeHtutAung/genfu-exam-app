import { useI18n } from '../../lib/i18n'

export default function LanguageSelect({ compact = false }) {
  const { language, setLanguage, languages, t } = useI18n()

  return (
    <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
      {!compact && <span>{t('language.label')}</span>}
      <select
        value={language}
        onChange={e => setLanguage(e.target.value)}
        aria-label={t('language.label')}
        className="rounded-lg border border-theme-border bg-bg px-2 py-1 text-xs font-medium text-text-primary outline-none transition-colors hover:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/10"
      >
        {languages.map(option => (
          <option key={option.code} value={option.code}>
            {compact ? option.shortLabel : option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
