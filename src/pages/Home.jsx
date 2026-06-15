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

function ProgressBadge({ progress }) {
  const { t } = useI18n()

  if (!progress) {
    return (
      <span className="bg-surface text-text-secondary text-xs px-2 py-0.5 rounded-full shrink-0 ml-3">
        {t('home.unattempted')}
      </span>
    )
  }

  const { examBest, examAttempts, examPassed, studyBest, studyAttempts } = progress

  if (examPassed) {
    return (
      <span className="bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-3">
        {t('home.passed')} {examBest}{t('common.points')} ✓
      </span>
    )
  }

  if (examAttempts > 0) {
    return (
      <span className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-3">
        {t('home.failed')} {examBest}{t('common.points')} ({examAttempts}{t('home.attempts')})
      </span>
    )
  }

  if (studyAttempts > 0) {
    return (
      <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-3">
        {t('home.studied')} {studyBest}{t('common.points')} ({studyAttempts}{t('home.attempts')})
      </span>
    )
  }

  return (
    <span className="bg-surface text-text-secondary text-xs px-2 py-0.5 rounded-full shrink-0 ml-3">
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
        .select('test_id, mode, score, passed')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)

      if (error || !data) return

      const map = {}
      for (const s of data) {
        if (!map[s.test_id]) {
          map[s.test_id] = { examBest: null, examAttempts: 0, examPassed: false, studyBest: null, studyAttempts: 0 }
        }
        const entry = map[s.test_id]
        if (s.mode === 'exam') {
          entry.examAttempts++
          if (s.passed) entry.examPassed = true
          if (entry.examBest === null || s.score > entry.examBest) entry.examBest = s.score
        } else if (s.mode === 'study') {
          entry.studyAttempts++
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
      <div className="min-h-screen bg-bg px-4 py-8">
        <div className="mx-auto max-w-3xl">

          {/* Header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary text-center">{t('home.eyebrow')}</p>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight text-center mt-1">{t('home.title')}</h1>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-br from-primary to-primary-hover text-white shadow-md shadow-primary/25 font-semibold rounded-xl px-4 py-3 text-sm transition-all'
                        : 'bg-bg border-[1.5px] border-theme-border text-text-secondary font-medium rounded-xl px-4 py-3 text-sm transition-all hover:bg-surface'
                    }
                  >
                    <span className="mr-1.5">{CATEGORY_EMOJI[cat.code] ?? ''}</span>
                    {field(cat, 'name')}
                  </button>
                ))}
              </div>

              {/* Test cards */}
              {tests.length > 0 ? (
                <StaggerList className="mt-6 space-y-3">
                  {tests.map(test => (
                    <div
                      key={test.id}
                      className="bg-bg border border-theme-border rounded-xl p-4 shadow-sm"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between">
                        <div>
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
                      <div className="flex gap-2 mt-3">
                        <Link
                          to={`/exam/${test.id}`}
                          className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-semibold text-center transition-colors hover:bg-primary-hover"
                        >
                          {t('home.examMode')}
                        </Link>
                        <Link
                          to={`/study/${test.id}`}
                          className="flex-1 bg-surface text-text-secondary rounded-lg py-2 text-sm font-medium text-center transition-colors hover:bg-theme-border"
                        >
                          {t('home.studyMode')}
                        </Link>
                      </div>
                    </div>
                  ))}
                </StaggerList>
              ) : (
                <p className="text-center text-text-secondary text-sm mt-8">
                  {t('home.noTests')}
                </p>
              )}
            </>
          )}

        </div>
      </div>
    </PageTransition>
  )
}
