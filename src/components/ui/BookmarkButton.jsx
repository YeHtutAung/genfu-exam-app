import useBookmark from '../../hooks/useBookmark'
import Button from './Button'
import { useI18n } from '../../lib/i18n'

export default function BookmarkButton({ questionId }) {
  const { t } = useI18n()
  const { bookmarked, loading, available, toggle } = useBookmark(questionId)

  if (!available) return null

  return (
    <Button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={bookmarked}
      variant={bookmarked ? 'outline' : 'secondary'}
      size="sm"
      className={`rounded-lg text-xs ${
        bookmarked
          ? 'border-primary bg-primary/10 text-primary'
          : ''
      }`}
    >
      {bookmarked ? t('bookmarks.saved') : t('bookmarks.save')}
    </Button>
  )
}
