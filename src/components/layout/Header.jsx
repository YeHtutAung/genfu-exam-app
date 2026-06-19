import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import ThemeToggle from '../ui/ThemeToggle'
import LanguageSelect from '../ui/LanguageSelect'
import Button from '../ui/Button'
import { useI18n } from '../../lib/i18n'

export default function Header({ theme, toggleTheme }) {
  const user = useAuthStore(s => s.user)
  const role = useAuthStore(s => s.role)
  const signOut = useAuthStore(s => s.signOut)
  const location = useLocation()
  const { t } = useI18n()

  if (location.pathname === '/login') return null

  const isActive = (path) => location.pathname === path

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??'

  return (
    <header className="sticky top-0 z-50 bg-bg border-b border-theme-border shadow-sm transition-colors">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:flex-nowrap sm:px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover text-white text-sm font-bold">
            G
          </div>
          <span className="truncate text-lg font-bold text-text-primary tracking-tight">
            Genfu
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:flex-none sm:flex-nowrap sm:gap-4">
          {user ? (
            <>
              <Link
                to="/"
                className={`min-h-10 rounded-lg px-2 py-2 text-sm font-medium transition-colors sm:min-h-0 sm:px-0 sm:py-0 ${
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
              <LanguageSelect compact />
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-white text-xs font-semibold">
                {initials}
              </div>
              <Button
                onClick={signOut}
                variant="secondary"
                size="sm"
                className="rounded-lg"
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
