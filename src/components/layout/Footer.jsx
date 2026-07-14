import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'
import LanguageSelect from '../ui/LanguageSelect'
import { useI18n } from '../../lib/i18n'

export default function Footer({ theme, toggleTheme }) {
  const location = useLocation()
  const { t } = useI18n()
  const hidden = location.pathname === '/login'
    || location.pathname.startsWith('/admin')
    || location.pathname.startsWith('/exam/')
    || location.pathname.startsWith('/simulation/')
    || (location.pathname.startsWith('/study/') && !location.pathname.includes('/summary/'))

  if (hidden) return null

  return (
    <footer className="border-t border-theme-border bg-surface">
      <nav className="mx-auto grid max-w-md grid-cols-3 px-3 py-2 sm:hidden" aria-label="Primary">
        <TabLink to="/" label={t('signal.footerHome')} active={location.pathname === '/'} glyph="⌂" />
        <TabLink to="/tips" label={t('signal.footerTips')} active={location.pathname === '/tips'} glyph="◇" />
        <TabLink to="/bookmarks" label={t('signal.footerSaved')} active={location.pathname === '/bookmarks'} glyph="▣" />
      </nav>
      <div className="mx-auto hidden max-w-4xl items-center justify-between px-4 py-5 text-sm text-text-secondary sm:flex">
        <span>© 2026 Genfu Exam App</span>
        <div className="flex items-center gap-3"><LanguageSelect /><ThemeToggle theme={theme} onToggle={toggleTheme} /></div>
      </div>
    </footer>
  )
}

function TabLink({ to, label, active, glyph }) {
  return (
    <Link to={to} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold ${active ? 'text-primary' : 'text-text-secondary'}`}>
      <span className="text-lg leading-none">{glyph}</span>{label}
    </Link>
  )
}
