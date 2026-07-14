import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import useNotifications from '../../hooks/useNotifications'
import { useI18n } from '../../lib/i18n'

const locales = { ja: 'ja-JP', en: 'en-US', my: 'my-MM' }

export default function NotificationBell({ userId }) {
  const { t, field, language } = useI18n()
  const { notifications, unreadCount, loading, error, markRead, markAllRead } = useNotifications(userId)
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const close = event => {
      if (event.key === 'Escape' || (event.type === 'mousedown' && !rootRef.current?.contains(event.target))) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [])

  const content = notification => {
    if (!notification.message_key) return { title: notification.title_jp, body: notification.body_jp }
    const test = notification.message_params?.test
    const testLabel = field(test, 'title') || (test?.test_number ? t('home.mockTest', { number: test.test_number }) : '')
    return {
      title: t('signal.notificationTitle'),
      body: t(notification.message_key, { test: testLabel }),
    }
  }

  const openNotification = async notification => {
    if (!notification.read_at) await markRead(notification.id).catch(() => {})
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-label={t('signal.notifications')}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        {unreadCount > 0 && <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-bold leading-4 text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-theme-border bg-bg shadow-xl">
          <div className="flex items-center justify-between border-b border-theme-border px-4 py-3">
            <h2 className="text-sm font-bold text-text-primary">{t('signal.notifications')}</h2>
            {unreadCount > 0 && <button type="button" onClick={() => markAllRead().catch(() => {})} className="text-xs font-semibold text-primary hover:underline">{t('signal.markAllRead')}</button>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading && <p className="px-4 py-8 text-center text-sm text-text-secondary">{t('common.loading')}</p>}
            {!loading && error && <p className="px-4 py-8 text-center text-sm text-wrong">{t('signal.notificationLoadError')}</p>}
            {!loading && !error && notifications.length === 0 && <p className="px-4 py-8 text-center text-sm text-text-secondary">{t('signal.noNotifications')}</p>}
            {!loading && !error && notifications.map(notification => {
              const localized = content(notification)
              return (
                <Link
                  key={notification.id}
                  to={notification.action_url || '/'}
                  onClick={() => openNotification(notification)}
                  className={`block border-b border-theme-border px-4 py-3 transition-colors last:border-0 hover:bg-surface ${notification.read_at ? '' : 'bg-primary/5'}`}
                >
                  <div className="flex gap-3">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read_at ? 'bg-transparent' : 'bg-primary'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-primary">{localized.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-text-secondary">{localized.body}</p>
                      <p className="mt-1.5 text-[11px] text-text-secondary">{new Date(notification.created_at).toLocaleDateString(locales[language] || locales.ja, { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
