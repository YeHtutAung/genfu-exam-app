import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'
import Spinner from '../components/ui/Spinner'
import PageTransition from '../components/ui/PageTransition'
import StaggerList from '../components/ui/StaggerList'
import { useI18n } from '../lib/i18n'

const CATEGORY_EMOJI = {
  genfu: '🛵',
  futsu_bike: '🏍️',
  daigata_bike: '🏍️',
  futsu_car: '🚗',
}

const SELECTED_CATEGORY_KEY = 'genfu-selected-category'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function formatRelativeDate(value) {
  if (!value) return 'No practice yet'

  const date = new Date(value)
  const now = new Date()
  const diffDays = Math.floor((now - date) / 86400000)

  if (Number.isNaN(diffDays)) return 'No practice yet'
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`

  return date.toLocaleDateString()
}

function getTestTitle(test, field) {
  return field(test, 'title') || `Mock Test ${test.test_number}`
}

function buildProgressDashboard(tests, progress) {
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

  let readinessLabel = 'Start practicing'
  let readinessTone = 'bg-surface text-text-secondary border-theme-border'
  let recommendation = 'Start with study mode, then take one timed exam.'

  if (readinessScore >= 85 && passedTests >= Math.min(3, totalTests || 3)) {
    readinessLabel = 'Ready for exam'
    readinessTone = 'bg-correct/10 text-correct border-correct/30'
    recommendation = 'Keep your rhythm. Take one more timed mock exam before the real test.'
  } else if (readinessScore >= 65) {
    readinessLabel = 'Almost ready'
    readinessTone = 'bg-warning/10 text-warning border-warning/30'
    recommendation = 'Review failed tests and pass two mock exams in a row.'
  } else if (examAttempts > 0 || studyAttempts > 0) {
    readinessLabel = 'Needs practice'
    readinessTone = 'bg-wrong/10 text-wrong border-wrong/30'
    recommendation = 'Use study mode for weak tests, then retry exam mode.'
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
  let actionLabel = 'Start study mode'
  let actionHint = 'Build confidence before taking a timed exam.'

  if (weakTest) {
    actionTest = weakTest.test
    actionMode = 'study'
    actionLabel = 'Review weak test'
    actionHint = 'Study the test with the lowest unpassed score.'
  } else if (readinessScore >= 65 && nextExamTest) {
    actionTest = nextExamTest
    actionMode = 'exam'
    actionLabel = 'Take timed exam'
    actionHint = 'Use exam mode to confirm your readiness.'
  } else if (unstartedTest) {
    actionTest = unstartedTest.test
    actionMode = 'study'
    actionLabel = 'Start next test'
    actionHint = 'Begin with guided study, then retry in exam mode.'
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
  const dashboard = buildProgressDashboard(tests, progress)
  const hasAnyPractice = dashboard.examAttempts > 0 || dashboard.studyAttempts > 0
  const actionHref = dashboard.actionTest
    ? `/${dashboard.actionMode}/${dashboard.actionTest.id}`
    : null

  return (
    <section className="mt-6 rounded-xl border border-theme-border bg-surface/70 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Readiness dashboard
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
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide">Ready score</p>
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
                Recommended next
              </p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {getTestTitle(dashboard.actionTest, field)}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {dashboard.actionHint}
              </p>
            </div>
            <Link
              to={actionHref}
              className="min-h-11 shrink-0 rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {dashboard.actionLabel}
            </Link>
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2 rounded-lg border border-theme-border bg-bg p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">Before the real exam</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            Review saved questions, exam-day tips, and the ready-to-roll checklist.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          {dashboard.readinessScore >= 65 && dashboard.actionTest && (
            <Link
              to={`/simulation/${dashboard.actionTest.id}`}
              className="min-h-10 rounded-lg border border-theme-border bg-bg px-3 py-2 text-center text-sm font-semibold text-text-secondary transition-colors hover:bg-surface"
            >
              Simulation
            </Link>
          )}
          <Link
            to="/bookmarks"
            className="min-h-10 rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Bookmarks
          </Link>
          <Link
            to="/tips"
            className="min-h-10 rounded-lg bg-surface px-3 py-2 text-center text-sm font-semibold text-text-secondary transition-colors hover:bg-theme-border"
          >
            Open tips
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <DashboardStat label="Completed" value={`${dashboard.completedTests}/${dashboard.totalTests}`} />
        <DashboardStat label="Passed tests" value={dashboard.passedTests} />
        <DashboardStat label="Pass rate" value={`${dashboard.passRate}%`} />
        <DashboardStat label="Last practice" value={formatRelativeDate(dashboard.latestPractice?.completed_at)} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-theme-border bg-bg p-3">
          <p className="text-xs font-medium text-text-secondary">Latest exam</p>
          {dashboard.latestExam ? (
            <>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {getTestTitle(dashboard.latestExam.test, field)}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {dashboard.latestExam.score}{' '}
                pts · {dashboard.latestExam.passed ? 'Passed' : 'Failed'} · {formatRelativeDate(dashboard.latestExam.completed_at)}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-text-secondary">Take your first timed exam.</p>
          )}
        </div>

        <div className="rounded-lg border border-theme-border bg-bg p-3">
          <p className="text-xs font-medium text-text-secondary">Focus next</p>
          {dashboard.weakTest ? (
            <>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {getTestTitle(dashboard.weakTest.test, field)}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                Best score {dashboard.weakTest.progress.examBest} pts. Review in study mode first.
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-text-secondary">
              {hasAnyPractice ? 'Keep passing tests consistently.' : 'Start with any test below.'}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function DashboardStat({ label, value }) {
  return (
    <div className="rounded-lg border border-theme-border bg-bg p-3">
      <p className="text-lg font-bold text-text-primary">{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
    </div>
  )
}

function ProgressBadge({ progress }) {
  const { t } = useI18n()

  if (!progress) {
    return (
      <span className="bg-surface text-text-secondary text-xs px-2 py-0.5 rounded-full shrink-0 sm:ml-3">
        {t('home.unattempted')}
      </span>
    )
  }

  const { examBest, examAttempts, examPassed, studyBest, studyAttempts } = progress

  if (examPassed) {
    return (
      <span className="bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded-full shrink-0 sm:ml-3">
        {t('home.passed')} {examBest}{t('common.points')} ✓
      </span>
    )
  }

  if (examAttempts > 0) {
    return (
      <span className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 sm:ml-3">
        {t('home.failed')} {examBest}{t('common.points')} ({examAttempts}{t('home.attempts')})
      </span>
    )
  }

  if (studyAttempts > 0) {
    return (
      <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 sm:ml-3">
        {t('home.studied')} {studyBest}{t('common.points')} ({studyAttempts}{t('home.attempts')})
      </span>
    )
  }

  return (
    <span className="bg-surface text-text-secondary text-xs px-2 py-0.5 rounded-full shrink-0 sm:ml-3">
      {t('home.unattempted')}
    </span>
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
      <div className="flex justify-center py-20">
        <Spinner />
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
                    <span className="mr-1.5">{CATEGORY_EMOJI[cat.code] ?? ''}</span>
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
                      <h2 className="text-lg font-bold text-text-primary">Practice tests</h2>
                      <p className="text-xs text-text-secondary">
                        Choose study mode for learning, exam mode for timed readiness.
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-secondary">
                      {tests.length} tests
                    </span>
                  </div>

                  <StaggerList className="space-y-3">
                    {tests.map(test => (
                      <div
                        key={test.id}
                        className="bg-bg border border-theme-border rounded-xl p-4 shadow-sm"
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
                          <Link
                            to={`/exam/${test.id}`}
                            className="min-h-11 bg-primary text-white rounded-lg px-3 py-3 text-sm font-semibold text-center transition-colors hover:bg-primary-hover"
                          >
                            {t('home.examMode')}
                          </Link>
                          <Link
                            to={`/study/${test.id}`}
                            className="min-h-11 bg-surface text-text-secondary rounded-lg px-3 py-3 text-sm font-medium text-center transition-colors hover:bg-theme-border"
                          >
                            {t('home.studyMode')}
                          </Link>
                          <Link
                            to={`/simulation/${test.id}`}
                            className="min-h-11 rounded-lg border border-theme-border bg-bg px-3 py-3 text-center text-sm font-semibold text-text-secondary transition-colors hover:bg-surface"
                          >
                            Simulation
                          </Link>
                        </div>
                      </div>
                    ))}
                  </StaggerList>
                </section>
              ) : (
                <div className="mt-6 rounded-xl border border-theme-border bg-surface p-6 text-center">
                  <h2 className="text-base font-semibold text-text-primary">No active tests yet</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t('home.noTests')}
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </PageTransition>
  )
}
