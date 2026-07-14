import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import ThemeToggle from '../ui/ThemeToggle'
import LanguageSelect from '../ui/LanguageSelect'
import Button from '../ui/Button'
import BrandMark from '../ui/BrandMark'
import NotificationBell from './NotificationBell'
import { useI18n } from '../../lib/i18n'

export default function Header({ theme, toggleTheme }) {
  const user = useAuthStore(s => s.user)
  const role = useAuthStore(s => s.role)
  const signOut = useAuthStore(s => s.signOut)
  const location = useLocation()
  const { t } = useI18n()

  const hidden = location.pathname === '/login'
    || location.pathname.startsWith('/admin')
    || location.pathname.startsWith('/exam/')
    || location.pathname.startsWith('/simulation/')
    || (location.pathname.startsWith('/study/') && !location.pathname.includes('/summary/'))

  if (hidden) return null

  const isActive = (path) => location.pathname === path

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??'

  return (
    <header className="sticky top-0 z-50 border-b border-theme-border bg-bg/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3.5">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <BrandMark className="h-9 w-9 rounded-xl" compact />
          <span className="truncate text-lg font-extrabold tracking-tight text-text-primary">
            Genfu
          </span>
        </Link>

        <nav className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                to="/"
                className={`hidden text-sm font-semibold transition-colors sm:block ${
                  isActive('/') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {t('common.home')}
              </Link>
              {role === 'admin' && (
                <Link
                  to="/admin"
                  className={`min-h-10 rounded-lg px-2 py-2 text-sm font-medium transition-colors sm:min-h-0 sm:px-0 sm:py-0 ${
                    location.pathname.startsWith('/admin') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {t('common.admin')}
                </Link>
              )}
              <div className="hidden sm:block"><LanguageSelect compact /></div>
              <div className="hidden sm:block"><ThemeToggle theme={theme} onToggle={toggleTheme} /></div>
              <NotificationBell userId={user.id} />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#17150F] text-xs font-bold text-white">
                {initials}
              </div>
              <Button
                onClick={signOut}
                variant="secondary"
                size="sm"
                className="hidden rounded-xl sm:inline-flex"
              >
                {t('common.logout')}
              </Button>
            </>
          ) : (
            <>
              <LanguageSelect compact />
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <Button
                as={Link}
                to="/login"
                size="sm"
                className="rounded-lg"
              >
                {t('common.login')}
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
