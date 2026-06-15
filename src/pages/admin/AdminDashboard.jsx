import { Link } from 'react-router-dom'
import useAdmin from '../../hooks/useAdmin'
import Spinner from '../../components/ui/Spinner'
import { useI18n } from '../../lib/i18n'

export default function AdminDashboard() {
  const { t } = useI18n()
  const { data: stats, loading, error } = useAdmin('stats')

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h1>

      {error && <p className="mb-4 text-sm text-wrong">{error}</p>}

      {stats && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label={t('admin.usersCount')} value={stats.users} />
            <StatCard label={t('admin.testsCount')} value={stats.tests} />
            <StatCard label={t('admin.sessionsCount')} value={stats.sessions} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <QuickLink to="/admin/tests" title={t('admin.testsManagement')} desc={t('admin.testsManagementDesc')} />
            <QuickLink to="/admin/users" title={t('admin.usersManagement')} desc={t('admin.usersManagementDesc')} />
            <QuickLink to="/admin/upload" title={t('admin.testUpload')} desc={t('admin.testUploadDesc')} />
            <QuickLink to="/admin/images" title={t('admin.questionImages')} desc={t('admin.questionImagesDesc')} />
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 text-center shadow-sm">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}

function QuickLink({ to, title, desc }) {
  return (
    <Link
      to={to}
      className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
    >
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </Link>
  )
}
