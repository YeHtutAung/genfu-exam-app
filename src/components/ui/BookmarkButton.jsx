import useBookmark from '../../hooks/useBookmark'
import Button from './Button'
import Icon from './Icon'
import { useI18n } from '../../lib/i18n'

export default function BookmarkButton({ questionId }) {
  const { t } = useI18n()
  const { bookmarked, loading, available, toggle } = useBookmark(questionId)

  if (!available) {
    return (
      <Button
        type="button"
        disabled
        variant="outline"
        size="sm"
        className="shrink-0 rounded-lg border-warning/30 bg-warning/10 text-xs text-warning"
        title={t('bookmarks.unavailable')}
      >
        <Icon name="bookmark" className="h-4 w-4" />
        {t('bookmarks.save')}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={bookmarked}
      variant={bookmarked ? 'outline' : 'secondary'}
      size="sm"
      className={`shrink-0 rounded-lg text-xs ${
        bookmarked
          ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10'
          : 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10'
      }`}
    >
      <Icon name="bookmark" className={bookmarked ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
      {bookmarked ? t('bookmarks.saved') : t('bookmarks.save')}
    </Button>
  )
}
