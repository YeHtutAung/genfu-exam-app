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

const SELECTED_CATEGORY_KEY = 'genfu-selected-category'

const CATEGORY_ICON = {
  genfu: 'moped',
  futsu_bike: 'motorcycle',
  daigata_bike: 'motorcycle',
  futsu_car: 'car',
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
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

  const completedTests = entries.filter(({ progress }) =>
    progress?.examAttempts > 0 || progress?.studyAttempts > 0
  ).length
  const passedTests = entries.filter(({ progress }) => progress?.examPassed).length
  const examAttempts = examSessions.length
  const studyAttempts = studySessions.length
  const passedAttempts = examSessions.filter(session => session.passed).length
  const passRate = examAttempts > 0 ? Math.round((passedAttempts / examAttempts) * 100) : 0
  const bestScore = examSessions.reduce((best, session) => {
    if (typeof session.score !== 'number') return best
    return best === null || session.score > best ? session.score : best
  }, null)
  const latestExam = [...examSessions].sort((a, b) =>
    new Date(b.completed_at) - new Date(a.completed_at)
  )[0]
  const latestPractice = [...examSessions, ...studySessions].sort((a, b) =>
    new Date(b.completed_at) - new Date(a.completed_at)
  )[0]

  const scorePercents = examSessions
    .filter(session => typeof session.score === 'number')
    .map(session => {
      const total = session.test?.total_points || 50
      return clamp((session.score / total) * 100, 0, 100)
    })
  const avgScorePercent = scorePercents.length > 0
    ? Math.round(scorePercents.reduce((sum, value) => sum + value, 0) / scorePercents.length)
    : 0

  const coverageScore = totalTests > 0 ? (completedTests / totalTests) * 25 : 0
  const passCoverageScore = totalTests > 0 ? (passedTests / totalTests) * 35 : 0
  const passRateScore = passRate * 0.25
  const scoreQualityScore = avgScorePercent * 0.15
  const readinessScore = Math.round(clamp(
    coverageScore + passCoverageScore + passRateScore + scoreQualityScore,
    0,
    100
  ))

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
    <Card as="section" className="mt-6 bg-surface/70 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {t('home.readinessDashboard')}
          </p>
          <h2 className="mt-1 text-xl font-bold text-text-primary">
            {dashboard.readinessLabel}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            {dashboard.recommendation}
          </p>
        </div>
        <div className={`shrink-0 rounded-xl border px-4 py-3 text-center ${dashboard.readinessTone}`}>
          <p className="text-3xl font-bold leading-none">{dashboard.readinessScore}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide">{t('home.readyScore')}</p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-bg">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${dashboard.readinessScore}%` }}
        />
      </div>

      {actionHref && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {t('home.recommendedNext')}
              </p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {getTestTitle(dashboard.actionTest, field, t)}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {dashboard.actionHint}
              </p>
            </div>
            <Button
              as={Link}
              to={actionHref}
              className="shrink-0 rounded-lg"
            >
              {dashboard.actionLabel}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2 rounded-lg border border-theme-border bg-bg p-3 sm:flex-row sm:items-center sm:justify-between">
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
          <Button
            as={Link}
            to="/bookmarks"
            size="sm"
            className="rounded-lg"
          >
            {t('home.bookmarks')}
          </Button>
          <Button
            as={Link}
            to="/tips"
            variant="secondary"
            size="sm"
            className="rounded-lg"
          >
            {t('home.openTips')}
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <DashboardStat label={t('home.completed')} value={`${dashboard.completedTests}/${dashboard.totalTests}`} />
        <DashboardStat label={t('home.passedTests')} value={dashboard.passedTests} />
        <DashboardStat label={t('home.passRate')} value={`${dashboard.passRate}%`} />
        <DashboardStat label={t('home.lastPractice')} value={formatRelativeDate(dashboard.latestPractice?.completed_at, t)} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Card className="rounded-lg p-3">
          <p className="text-xs font-medium text-text-secondary">{t('home.latestExam')}</p>
          {dashboard.latestExam ? (
            <>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {getTestTitle(dashboard.latestExam.test, field, t)}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {dashboard.latestExam.score}{' '}
                {t('common.points')} · {dashboard.latestExam.passed ? t('home.passed') : t('home.failed')} · {formatRelativeDate(dashboard.latestExam.completed_at, t)}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-text-secondary">{t('home.takeFirstTimedExam')}</p>
          )}
        </Card>

        <Card className="rounded-lg p-3">
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
        </Card>
      </div>
    </Card>
  )
}

function DashboardStat({ label, value }) {
  return (
    <Card className="rounded-lg p-3">
      <p className="text-lg font-bold text-text-primary">{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
    </Card>
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
        <div className="mx-auto max-w-3xl">

          {/* Header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary text-center">{t('home.eyebrow')}</p>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight text-center mt-1 sm:text-3xl">{t('home.title')}</h1>
            <p className="text-sm text-text-secondary text-center mt-1">{t('home.subtitle')}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-wrong/10 border border-wrong/20 text-wrong text-sm p-4 text-center mt-6">
              {error}
            </div>
          )}

          {/* Category buttons */}
          {categories.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3 mt-6 sm:grid-cols-4">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={
                      selectedCategory === cat.id
                        ? 'min-h-11 bg-gradient-to-br from-primary to-primary-hover text-white shadow-md shadow-primary/25 font-semibold rounded-xl px-4 py-3 text-sm transition-all'
                        : 'min-h-11 bg-bg border-[1.5px] border-theme-border text-text-secondary font-medium rounded-xl px-4 py-3 text-sm transition-all hover:bg-surface'
                    }
                  >
                    <Icon name={CATEGORY_ICON[cat.code] ?? 'focus'} className="mr-1.5 inline h-4 w-4 align-[-2px]" />
                    {field(cat, 'name')}
                  </button>
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
                      >
                        {/* Top row */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-text-primary">
                              {field(test, 'title') || t('home.mockTest', { number: test.test_number })}
                            </h3>
                            <p className="text-xs text-text-secondary mt-0.5">
                              {t('home.testMeta', {
                                questions: test.question_count ?? 48,
                                minutes: Math.round((test.time_limit ?? 1800) / 60),
                                score: test.pass_score,
                              })}
                            </p>
                          </div>
                          <ProgressBadge progress={progress[test.id]} />
                        </div>

                        {/* Bottom row */}
                        <div className="grid grid-cols-1 gap-2 mt-3 sm:grid-cols-3">
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
