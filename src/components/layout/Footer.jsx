import { useLocation } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'

export default function Footer({ theme, toggleTheme }) {
  const location = useLocation()

  const hidden = ['/login'].includes(location.pathname)
    || location.pathname.startsWith('/exam/')
    || (location.pathname.startsWith('/study/') && !location.pathname.includes('/summary/'))

  if (hidden) return null

  return (
    <footer className="border-t border-theme-border bg-bg">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between text-sm text-text-secondary">
        <span>© 2026 Genfu Exam App</span>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
    </footer>
  )
}