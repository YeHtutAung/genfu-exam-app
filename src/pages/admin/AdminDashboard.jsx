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
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Operations</p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">{t('admin.dashboard')}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Track learner activity and identify tests that may need content review.
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-wrong">{error}</p>}

      {stats && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard label={t('admin.usersCount')} value={stats.users} />
            <StatCard label={t('admin.testsCount')} value={stats.tests} />
            <StatCard label="Active tests" value={stats.activeTests} />
            <StatCard label={t('admin.sessionsCount')} value={stats.sessions} />
            <StatCard label="Pass rate" value={`${stats.passRate}%`} />
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-lg border border-theme-border bg-bg p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Tests needing review</h2>
                  <p className="text-xs text-text-secondary">Lowest pass-rate tests from the latest 500 completed sessions.</p>
                </div>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-secondary">
                  {stats.examAttempts} exam attempts
                </span>
              </div>

              {stats.testPerformance.length === 0 ? (
                <p className="rounded-lg bg-surface p-4 text-sm text-text-secondary">
                  No completed exam attempts yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.testPerformance.map(test => (
                    <PerformanceRow key={test.test_id} test={test} />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-lg border border-theme-border bg-bg p-4 shadow-sm">
              <h2 className="text-lg font-bold text-text-primary">Recent activity</h2>
              <p className="mb-3 text-xs text-text-secondary">Latest completed exam or study sessions.</p>
              {stats.recentAttempts.length === 0 ? (
                <p className="rounded-lg bg-surface p-4 text-sm text-text-secondary">
                  No recent attempts yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.recentAttempts.map(attempt => (
                    <RecentAttempt key={attempt.id} attempt={attempt} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    <div className="rounded-lg border border-theme-border bg-bg p-4 text-center shadow-sm">
      <p className="text-2xl font-bold text-text-primary sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-text-secondary sm:text-sm">{label}</p>
    </div>
  )
}

function PerformanceRow({ test }) {
  const title = test.title_en || test.title_jp || `Test ${test.test_number ?? '-'}`

  return (
    <div className="rounded-lg border border-theme-border bg-surface p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
          test.passRate < 50
            ? 'bg-wrong/10 text-wrong'
            : 'bg-warning/10 text-warning'
        }`}>
          {test.passRate}% pass
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">
        <div className="h-full rounded-full bg-primary" style={{ width: `${test.averageScore}%` }} />
      </div>
      <p className="mt-1 text-xs text-text-secondary">
        {test.attempts} attempts · average score {test.averageScore}%
      </p>
    </div>
  )
}

function RecentAttempt({ attempt }) {
  const title = attempt.title_en || attempt.title_jp || `Test ${attempt.test_number ?? '-'}`
  const date = attempt.completed_at
    ? new Date(attempt.completed_at).toLocaleDateString()
    : ''

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-surface p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary">{attempt.mode} · {date}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
        attempt.mode === 'study'
          ? 'bg-primary/10 text-primary'
          : attempt.passed
            ? 'bg-correct/10 text-correct'
            : 'bg-wrong/10 text-wrong'
      }`}>
        {attempt.mode === 'study' ? 'Study' : attempt.passed ? 'Pass' : 'Fail'} {attempt.score ?? '-'}
      </span>
    </div>
  )
}

function QuickLink({ to, title, desc }) {
  return (
    <Link
      to={to}
      className="block rounded-lg border border-theme-border bg-bg p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-surface"
    >
      <h3 className="font-medium text-text-primary">{title}</h3>
      <p className="mt-1 text-sm text-text-secondary">{desc}</p>
    </Link>
  )
}
