import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import BrandMark from '../ui/BrandMark'
import { useI18n } from '../../lib/i18n'

const navItems = [
  { to: '/admin', labelKey: 'admin.dashboard', icon: '⌂', end: true },
  { to: '/admin/tests', labelKey: 'admin.testsManagement', icon: '▤' },
  { to: '/admin/users', labelKey: 'admin.usersManagement', icon: '◉' },
  { to: '/admin/analytics', labelKey: 'signal.analytics', icon: '↗' },
  { to: '/admin/upload', labelKey: 'admin.testUpload', icon: '↑' },
  { to: '/admin/images', labelKey: 'admin.questionImages', icon: '▧' },
]

export default function AdminLayout() {
  const user = useAuthStore(s => s.user)
  const { t } = useI18n()
  const location = useLocation()
  const isDashboard = location.pathname === '/admin'
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'AD'

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[238px_1fr]">
      <aside className="hidden min-h-screen bg-[#17150F] p-4 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <Link to="/" className="mb-8 flex items-center gap-3 px-2 py-2">
          <BrandMark className="h-10 w-10 border border-[#33302A]" compact />
          <span className="text-xl font-extrabold tracking-tight">Genfu</span>
        </Link>
        <nav className="space-y-1.5" aria-label={t('signal.adminNavigation')}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${isActive ? 'bg-primary text-white' : 'text-[#B7AF9A] hover:bg-[#24211B] hover:text-white'}`}>
              <span className="w-5 text-center text-base">{item.icon}</span>{t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-[#33302A] px-2 pt-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[#17150F]">{initials}</span>
          <div className="min-w-0"><p className="truncate text-xs font-semibold text-white">{user?.email}</p><p className="text-[11px] text-[#B7AF9A]">{t('admin.adminRole')}</p></div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-9 lg:py-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <Link to={isDashboard ? '/' : '/admin'} className="text-sm font-bold text-text-primary">← {isDashboard ? t('common.home') : t('admin.dashboard')}</Link>
            <BrandMark className="h-9 w-9 rounded-xl" compact />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
