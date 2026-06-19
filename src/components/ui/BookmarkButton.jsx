import useBookmark from '../../hooks/useBookmark'
import { useI18n } from '../../lib/i18n'

export default function BookmarkButton({ questionId }) {
  const { t } = useI18n()
  const { bookmarked, loading, available, toggle } = useBookmark(questionId)

  if (!available) return null

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={bookmarked}
      className={`min-h-10 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
        bookmarked
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-theme-border bg-surface text-text-secondary hover:bg-theme-border'
      }`}
    >
      {bookmarked ? t('bookmarks.saved') : t('bookmarks.save')}
    </button>
  )
}
