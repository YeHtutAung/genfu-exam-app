import { Link } from 'react-router-dom'
import useAdmin from '../../hooks/useAdmin'
import Spinner from '../../components/ui/Spinner'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
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
        <Breadcrumbs items={[{ label: t('common.admin') }]} />
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t('admin.operations')}</p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">{t('admin.dashboard')}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t('admin.dashboardDescription')}
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-wrong">{error}</p>}

      {stats && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard label={t('admin.usersCount')} value={stats.users} />
            <StatCard label={t('admin.testsCount')} value={stats.tests} />
            <StatCard label={t('admin.activeTests')} value={stats.activeTests} />
            <StatCard label={t('admin.sessionsCount')} value={stats.sessions} />
            <StatCard label={t('admin.passRate')} value={`${stats.passRate}%`} />
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card as="section" className="rounded-lg">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-text-primary">{t('admin.testsNeedingReview')}</h2>
                  <p className="text-xs text-text-secondary">{t('admin.testsNeedingReviewDesc')}</p>
                </div>
                <Badge className="px-3 py-1">
                  {t('admin.examAttempts', { count: stats.examAttempts })}
                </Badge>
              </div>

              {stats.testPerformance.length === 0 ? (
                <p className="rounded-lg bg-surface p-4 text-sm text-text-secondary">
                  {t('admin.noCompletedExamAttempts')}
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.testPerformance.map(test => (
                    <PerformanceRow key={test.test_id} test={test} t={t} />
                  ))}
                </div>
              )}
            </Card>

            <Card as="section" className="rounded-lg">
              <h2 className="text-lg font-bold text-text-primary">{t('admin.recentActivity')}</h2>
              <p className="mb-3 text-xs text-text-secondary">{t('admin.recentActivityDesc')}</p>
              {stats.recentAttempts.length === 0 ? (
                <p className="rounded-lg bg-surface p-4 text-sm text-text-secondary">
                  {t('admin.noRecentAttempts')}
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.recentAttempts.map(attempt => (
                    <RecentAttempt key={attempt.id} attempt={attempt} t={t} />
                  ))}
                </div>
              )}
            </Card>
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
    <Card className="rounded-lg text-center">
      <p className="text-2xl font-bold text-text-primary sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-text-secondary sm:text-sm">{label}</p>
    </Card>
  )
}

function PerformanceRow({ test, t }) {
  const title = test.title_en || test.title_jp || t('home.mockTest', { number: test.test_number ?? '-' })

  return (
    <Card className="rounded-lg bg-surface p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <Badge tone={test.passRate < 50 ? 'wrong' : 'warning'} className="py-1 font-semibold">
          {t('admin.passPercent', { percent: test.passRate })}
        </Badge>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">
        <div className="h-full rounded-full bg-primary" style={{ width: `${test.averageScore}%` }} />
      </div>
      <p className="mt-1 text-xs text-text-secondary">
        {t('admin.attemptsAverage', { attempts: test.attempts, average: test.averageScore })}
      </p>
    </Card>
  )
}

function RecentAttempt({ attempt, t }) {
  const title = attempt.title_en || attempt.title_jp || t('home.mockTest', { number: attempt.test_number ?? '-' })
  const date = attempt.completed_at
    ? new Date(attempt.completed_at).toLocaleDateString()
    : ''

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-surface p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary">{attempt.mode} · {date}</p>
      </div>
      <Badge
        tone={attempt.mode === 'study' ? 'primary' : attempt.passed ? 'correct' : 'wrong'}
        className="shrink-0 py-1 font-semibold"
      >
        {attempt.mode === 'study' ? t('admin.studyLabel') : attempt.passed ? t('admin.passLabel') : t('admin.failLabel')} {attempt.score ?? '-'}
      </Badge>
    </div>
  )
}

function QuickLink({ to, title, desc }) {
  return (
    <Card
      as={Link}
      to={to}
      className="block rounded-lg p-5 transition-colors hover:border-primary/40 hover:bg-surface"
    >
      <h3 className="font-medium text-text-primary">{title}</h3>
      <p className="mt-1 text-sm text-text-secondary">{desc}</p>
    </Card>
  )
}
