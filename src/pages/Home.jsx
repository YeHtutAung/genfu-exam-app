import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'
import Spinner from '../components/ui/Spinner'
import PageTransition from '../components/ui/PageTransition'
import StaggerList from '../components/ui/StaggerList'
import { TestListSkeleton } from '../components/ui/LoadingPanels'
import Icon from '../components/ui/Icon'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useI18n } from '../lib/i18n'
import { calculateReadiness, readinessPresentation } from '../lib/readiness'

const SELECTED_CATEGORY_KEY = 'genfu-selected-category'

const CATEGORY_ICON = {
  genfu: 'moped',
  futsu_bike: 'motorcycle',
  daigata_bike: 'motorcycle',
  futsu_car: 'car',
}

function formatRelativeDate(value, t) {
  if (!value) return t('home.noPracticeYet')

  const date = new Date(value)
  const now = new Date()
  const diffDays = Math.floor((now - date) / 86400000)

  if (Number.isNaN(diffDays)) return t('home.noPracticeYet')
  if (diffDays <= 0) return t('home.today')
  if (diffDays === 1) return t('home.yesterday')
  if (diffDays < 7) return t('home.daysAgo', { count: diffDays })
  if (diffDays < 30) return t('home.weeksAgo', { count: Math.floor(diffDays / 7) })

  return date.toLocaleDateString()
}

function getTestTitle(test, field, t) {
  return field(test, 'title') || t('home.mockTest', { number: test.test_number })
}

function buildProgressDashboard(tests, progress, t) {
  const totalTests = tests.length
  const entries = tests.map(test => ({
    test,
    progress: progress[test.id],
  }))

  const examSessions = entries.flatMap(({ test, progress }) =>
    (progress?.examSessions ?? []).map(session => ({ ...session, test }))
  )
  const studySessions = entries.flatMap(({ test, progress }) =>
    (progress?.studySessions ?? []).map(session => ({ ...session, test }))
  )

  const metrics = calculateReadiness({ tests, sessions: [...examSessions, ...studySessions] })
  const { completedTests, passedTests, examAttempts, studyAttempts, passRate, bestScore, readinessScore } = metrics
  const latestExam = [...examSessions].sort((a, b) =>
    new Date(b.completed_at) - new Date(a.completed_at)
  )[0]
  const latestPractice = [...examSessions, ...studySessions].sort((a, b) =>
    new Date(b.completed_at) - new Date(a.completed_at)
  )[0]

  let readinessLabel = t('home.startPracticing')
  let readinessTone = 'bg-surface text-text-secondary border-theme-border'
  let recommendation = t('home.recommendationStart')

  if (readinessScore >= 85 && passedTests >= Math.min(3, totalTests || 3)) {
    readinessLabel = t('home.readyForExam')
    readinessTone = 'bg-correct/10 text-correct border-correct/30'
    recommendation = t('home.recommendationReady')
  } else if (readinessScore >= 65) {
    readinessLabel = t('home.almostReady')
    readinessTone = 'bg-warning/10 text-warning border-warning/30'
    recommendation = t('home.recommendationAlmost')
  } else if (examAttempts > 0 || studyAttempts > 0) {
    readinessLabel = t('home.needsPractice')
    readinessTone = 'bg-wrong/10 text-wrong border-wrong/30'
    recommendation = t('home.recommendationPractice')
  }

  const weakTest = entries
    .filter(({ progress }) => progress?.examAttempts > 0 && !progress?.examPassed)
    .sort((a, b) => (a.progress.examBest ?? 0) - (b.progress.examBest ?? 0))[0]
  const unstartedTest = entries.find(({ progress }) =>
    !progress || (progress.examAttempts === 0 && progress.studyAttempts === 0)
  )
  const nextExamTest = latestExam?.test ?? tests[0]

  let actionTest = unstartedTest?.test ?? weakTest?.test ?? nextExamTest
  let actionMode = 'study'
  let actionLabel = t('home.startStudyMode')
  let actionHint = t('home.startStudyHint')

  if (weakTest) {
    actionTest = weakTest.test
    actionMode = 'study'
    actionLabel = t('home.reviewWeakTest')
    actionHint = t('home.reviewWeakHint')
  } else if (readinessScore >= 65 && nextExamTest) {
    actionTest = nextExamTest
    actionMode = 'exam'
    actionLabel = t('home.takeTimedExam')
    actionHint = t('home.takeTimedHint')
  } else if (unstartedTest) {
    actionTest = unstartedTest.test
    actionMode = 'study'
    actionLabel = t('home.startNextTest')
    actionHint = t('home.startNextHint')
  }

  return {
    totalTests,
    completedTests,
    passedTests,
    examAttempts,
    studyAttempts,
    passRate,
    bestScore,
    latestExam,
    latestPractice,
    readinessScore,
    readinessBand: metrics.band,
    readinessLabel,
    readinessTone,
    recommendation,
    weakTest,
    actionTest,
    actionMode,
    actionLabel,
    actionHint,
  }
}

function LearnerDashboard({ tests, progress, field }) {
  const { t } = useI18n()
  const dashboard = buildProgressDashboard(tests, progress, t)
  const hasAnyPractice = dashboard.examAttempts > 0 || dashboard.studyAttempts > 0
  const actionHref = dashboard.actionTest
    ? `/${dashboard.actionMode}/${dashboard.actionTest.id}`
    : null

  return (
    <section className="mt-5 sm:mt-6">
      <div className="px-1 py-2 sm:px-0">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-xl">
            <p className="signal-eyebrow">
              {t('home.readinessDashboard')}
            </p>
            <h2 className="mt-1 text-[27px] font-extrabold leading-tight tracking-tight text-text-primary">
              {dashboard.readinessLabel}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {dashboard.recommendation}
            </p>
          </div>
          <div className="shrink-0 text-right" style={{ color: readinessPresentation[dashboard.readinessBand].color }}>
            <p className="num text-[52px] font-extrabold leading-none tracking-tight">{dashboard.readinessScore}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em]">{t('home.readyScore')}</p>
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#EAE5D8]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${dashboard.readinessScore}%`, backgroundColor: readinessPresentation[dashboard.readinessBand].color }}
          />
        </div>
      </div>

      <div className="pt-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <DashboardStat label={t('home.completed')} value={`${dashboard.completedTests}/${dashboard.totalTests}`} tone="primary" />
          <DashboardStat label={t('home.passedTests')} value={dashboard.passedTests} tone="correct" />
          <DashboardStat label={t('home.passRate')} value={`${dashboard.passRate}%`} tone="warning" />
          <DashboardStat label={t('home.lastPractice')} value={formatRelativeDate(dashboard.latestPractice?.completed_at, t)} tone="ai" />
        </div>

        {actionHref && (
          <div className="mt-4 rounded-2xl bg-[#17150F] p-4 text-white shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#9FB0FF]">
                  {t('home.recommendedNext')}
                </p>
                <p className="mt-1 text-base font-bold text-white">
                  {getTestTitle(dashboard.actionTest, field, t)}
                </p>
                <p className="mt-0.5 text-xs text-[#B7AF9A]">
                  {dashboard.actionHint}
                </p>
              </div>
              <Button
                as={Link}
                to={actionHref}
                className="shrink-0 rounded-lg shadow-md shadow-primary/20"
              >
                {dashboard.actionLabel}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-theme-border bg-bg/80 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t('home.beforeRealExam')}</p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {t('home.beforeRealExamDetail')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {dashboard.readinessScore >= 65 && dashboard.actionTest && (
              <Button
                as={Link}
                to={`/simulation/${dashboard.actionTest.id}`}
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                {t('home.simulation')}
              </Button>
            )}
            <Button as={Link} to="/bookmarks" size="sm" className="rounded-lg">
              {t('home.bookmarks')}
            </Button>
            <Button as={Link} to="/tips" variant="secondary" size="sm" className="rounded-lg">
              {t('home.openTips')}
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-theme-border/80 bg-bg/80 p-3">
            <p className="text-xs font-medium text-text-secondary">{t('home.latestExam')}</p>
            {dashboard.latestExam ? (
              <>
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  {getTestTitle(dashboard.latestExam.test, field, t)}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {dashboard.latestExam.score}{' '}
                  {t('common.points')} / {dashboard.latestExam.passed ? t('home.passed') : t('home.failed')} / {formatRelativeDate(dashboard.latestExam.completed_at, t)}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-text-secondary">{t('home.takeFirstTimedExam')}</p>
            )}
          </div>

          <div className="rounded-lg border border-theme-border/80 bg-bg/80 p-3">
            <p className="text-xs font-medium text-text-secondary">{t('home.focusNext')}</p>
            {dashboard.weakTest ? (
              <>
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  {getTestTitle(dashboard.weakTest.test, field, t)}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {t('home.bestScoreReview', { score: dashboard.weakTest.progress.examBest })}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-text-secondary">
                {hasAnyPractice ? t('home.keepPassing') : t('home.startAnyTest')}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardStat({ label, value, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    correct: 'bg-correct/10 text-correct ring-correct/15',
    warning: 'bg-warning/10 text-warning ring-warning/15',
    ai: 'bg-ai/10 text-ai ring-ai/15',
  }

  return (
    <div className="rounded-xl border border-theme-border bg-surface p-3">
      <p className={`num text-lg font-extrabold ${tones[tone]?.split(' ')[1] ?? 'text-text-primary'}`}>{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
    </div>
  )
}

function ProgressBadge({ progress }) {
  const { t } = useI18n()

  if (!progress) {
    return (
      <Badge className="shrink-0 sm:ml-3">
        {t('home.unattempted')}
      </Badge>
    )
  }

  const { examBest, examAttempts, examPassed, studyBest, studyAttempts } = progress

  if (examPassed) {
    return (
      <Badge tone="correct" className="shrink-0 bg-correct text-white sm:ml-3">
        {t('home.passed')} {examBest}{t('common.points')} ✓
      </Badge>
    )
  }

  if (examAttempts > 0) {
    return (
      <Badge tone="wrong" className="shrink-0 sm:ml-3">
        {t('home.failed')} {examBest}{t('common.points')} ({examAttempts}{t('home.attempts')})
      </Badge>
    )
  }

  if (studyAttempts > 0) {
    return (
      <Badge tone="ai" className="shrink-0 sm:ml-3">
        {t('home.studied')} {studyBest}{t('common.points')} ({studyAttempts}{t('home.attempts')})
      </Badge>
    )
  }

  return (
    <Badge className="shrink-0 sm:ml-3">
      {t('home.unattempted')}
    </Badge>
  )
}

export default function Home() {
  const { t, field } = useI18n()
  const user = useAuthStore(s => s.user)
  const [categories, setCategories] = useState([])
  const [tests, setTests] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState({})

  // Fetch active categories on mount
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('code')

      if (error) {
        setError(error.message)
      } else {
        setCategories(data)
        const storedCategoryId = localStorage.getItem(SELECTED_CATEGORY_KEY)
        const storedCategory = data.find(c => c.id === storedCategoryId)
        const genfu = data.find(c => c.code === 'genfu')
        setSelectedCategory(storedCategory?.id ?? genfu?.id ?? data[0]?.id ?? null)
      }
      setLoading(false)
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem(SELECTED_CATEGORY_KEY, selectedCategory)
    }
  }, [selectedCategory])

  // Fetch user progress across all tests (once on mount)
  useEffect(() => {
    if (!user) return

    async function fetchProgress() {
      const { data, error } = await supabase
        .from('exam_sessions')
        .select('test_id, mode, score, passed, started_at, completed_at')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)

      if (error || !data) return

      const map = {}
      for (const s of data) {
        if (!map[s.test_id]) {
          map[s.test_id] = {
            examBest: null,
            examAttempts: 0,
            examPassed: false,
            examSessions: [],
            studyBest: null,
            studyAttempts: 0,
            studySessions: [],
          }
        }
        const entry = map[s.test_id]
        if (s.mode === 'exam') {
          entry.examAttempts++
          entry.examSessions.push(s)
          if (s.passed) entry.examPassed = true
          if (entry.examBest === null || s.score > entry.examBest) entry.examBest = s.score
        } else if (s.mode === 'study') {
          entry.studyAttempts++
          entry.studySessions.push(s)
          if (entry.studyBest === null || s.score > entry.studyBest) entry.studyBest = s.score
        }
      }
      setProgress(map)
    }
    fetchProgress()
  }, [user])

  // Fetch tests when category changes
  useEffect(() => {
    if (!selectedCategory) return

    async function fetchTests() {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('category_id', selectedCategory)
        .eq('active', true)
        .order('test_number')

      if (error) {
        setError(error.message)
      } else {
        setTests(data)
      }
    }
    fetchTests()
  }, [selectedCategory])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-3 py-8 sm:px-4">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
        <TestListSkeleton />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-bg px-3 py-6 sm:px-4 sm:py-8">
        <div className="mx-auto max-w-4xl">

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-wrong/10 border border-wrong/20 text-wrong text-sm p-4 text-center mt-6">
              {error}
            </div>
          )}

          {/* Category buttons */}
          {categories.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    variant={selectedCategory === cat.id ? 'primary' : 'outline'}
                    className={
                      selectedCategory === cat.id
                        ? 'px-4 py-3'
                        : 'border-[1.5px] px-4 py-3 font-medium'
                    }
                  >
                    <Icon name={CATEGORY_ICON[cat.code] ?? 'focus'} className="mr-1.5 inline h-4 w-4 align-[-2px]" />
                    {field(cat, 'name')}
                  </Button>
                ))}
              </div>

              {tests.length > 0 && (
                <LearnerDashboard tests={tests} progress={progress} field={field} />
              )}

              {/* Test cards */}
              {tests.length > 0 ? (
                <section className="mt-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-text-primary">{t('home.practiceTests')}</h2>
                      <p className="text-xs text-text-secondary">
                        {t('home.practiceTestsHint')}
                      </p>
                    </div>
                    <Badge className="shrink-0 px-3 py-1">
                      {t('home.testsCount', { count: tests.length })}
                    </Badge>
                  </div>

                  <StaggerList className="space-y-3">
                    {tests.map(test => (
                      <Card
                        key={test.id}
                        className="group overflow-hidden p-0 transition-colors hover:border-primary/30"
                      >
                        {/* Top row */}
                        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 gap-3">
                            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-[#EEF1FE] text-primary">
                              <Icon name="book" className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-base font-semibold text-text-primary">
                                {field(test, 'title') || t('home.mockTest', { number: test.test_number })}
                              </h3>
                              <p className="mt-0.5 text-xs text-text-secondary">
                                {t('home.testMeta', {
                                  questions: test.question_count ?? 48,
                                  minutes: Math.round((test.time_limit ?? 1800) / 60),
                                  score: test.pass_score,
                                })}
                              </p>
                            </div>
                          </div>
                          <ProgressBadge progress={progress[test.id]} />
                        </div>

                        {/* Bottom row */}
                        <div className="grid grid-cols-3 gap-2 border-t border-theme-border p-3">
                          <Button
                            as={Link}
                            to={`/exam/${test.id}`}
                            className="rounded-lg"
                          >
                            {t('home.examMode')}
                          </Button>
                          <Button
                            as={Link}
                            to={`/study/${test.id}`}
                            variant="secondary"
                            className="rounded-lg"
                          >
                            {t('home.studyMode')}
                          </Button>
                          <Button
                            as={Link}
                            to={`/simulation/${test.id}`}
                            variant="outline"
                            className="rounded-lg"
                          >
                            {t('home.simulation')}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </StaggerList>
                </section>
              ) : (
                <Card className="mt-6 bg-surface p-6 text-center">
                  <h2 className="text-base font-semibold text-text-primary">{t('home.noActiveTests')}</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t('home.noTests')}
                  </p>
                </Card>
              )}
            </>
          )}

        </div>
      </div>
    </PageTransition>
  )
}
