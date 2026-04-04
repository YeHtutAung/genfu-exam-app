import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import ThemeToggle from '../ui/ThemeToggle'

export default function Header({ theme, toggleTheme }) {
  const user = useAuthStore(s => s.user)
  const role = useAuthStore(s => s.role)
  const signOut = useAuthStore(s => s.signOut)
  const location = useLocation()

  if (location.pathname === '/login') return null

  const isActive = (path) => location.pathname === path

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??'

  return (
    <header className="sticky top-0 z-50 bg-bg border-b border-theme-border shadow-sm transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover text-white text-sm font-bold">
            G
          </div>
          <span className="text-lg font-bold text-text-primary tracking-tight">
            Genfu
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          {user ? (
            <>
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                ホーム
              </Link>
              {role === 'admin' && (
                <Link
                  to="/admin"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  管理
                </Link>
              )}
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-white text-xs font-semibold">
                {initials}
              </div>
              <button
                onClick={signOut}
                className="rounded-lg bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-theme-border"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <Link
                to="/login"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
              >
                ログイン
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
