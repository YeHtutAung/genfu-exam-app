import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'
import Spinner from '../components/ui/Spinner'
import PageTransition from '../components/ui/PageTransition'
import { useI18n } from '../lib/i18n'

export default function Bookmarks() {
  const { field, t } = useI18n()
  const user = useAuthStore(s => s.user)
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      if (!user?.id) return

      setLoading(true)
      const { data, error } = await supabase
        .from('question_bookmarks')
        .select(`
          id,
          created_at,
          questions (
            id,
            question_number,
            question_jp,
            question_en,
            question_my,
            type,
            points,
            test_id,
            tests (
              id,
              test_number,
              title_jp,
              title_en,
              title_my,
              categories (
                id,
                code,
                name_jp,
                name_en,
                name_my
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setError(t('bookmarks.unavailable'))
        setBookmarks([])
      } else {
        setError(null)
        setBookmarks(data || [])
      }
      setLoading(false)
    }

    load()
  }, [user?.id])

  const removeBookmark = async (bookmarkId) => {
    setBookmarks(current => current.filter(item => item.id !== bookmarkId))
    await supabase
      .from('question_bookmarks')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', user.id)
  }

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
        <main className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {t('bookmarks.savedQuestions')}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-text-primary sm:text-3xl">
                {t('bookmarks.title')}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {t('bookmarks.description')}
              </p>
            </div>
            <Link
              to="/"
              className="min-h-11 rounded-lg bg-surface px-4 py-3 text-center text-sm font-semibold text-text-secondary transition-colors hover:bg-theme-border"
            >
              {t('common.backHome')}
            </Link>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-text-primary">
              {error}
            </div>
          )}

          {!error && bookmarks.length === 0 && (
            <div className="mt-6 rounded-xl border border-theme-border bg-surface p-6 text-center">
              <h2 className="text-base font-semibold text-text-primary">{t('bookmarks.emptyTitle')}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {t('bookmarks.emptyDetail')}
              </p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {bookmarks.map(bookmark => {
              const question = bookmark.questions
              const test = question?.tests
              const category = test?.categories

              return (
                <article key={bookmark.id} className="rounded-xl border border-theme-border bg-bg p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {field(category, 'name', t('bookmarks.categoryFallback'))} · {field(test, 'title') || t('home.mockTest', { number: test?.test_number ?? '-' })}
                      </p>
                      <h2 className="mt-1 text-sm font-semibold text-text-primary">
                        {t('common.questionShort')}{question?.question_number}. {field(question, 'question')}
                      </h2>
                      <p className="mt-1 text-xs text-text-secondary">
                        {question?.type === 'scenario' ? t('exam.scenario') : t('exam.standard')} · {question?.points}{t('common.points')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBookmark(bookmark.id)}
                      className="min-h-10 rounded-lg bg-surface px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-theme-border"
                    >
                      {t('bookmarks.remove')}
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Link
                      to={`/study/${question.test_id}`}
                      className="min-h-11 rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                    >
                      {t('bookmarks.reviewStudy')}
                    </Link>
                    <Link
                      to={`/exam/${question.test_id}`}
                      className="min-h-11 rounded-lg bg-surface px-4 py-3 text-center text-sm font-semibold text-text-secondary transition-colors hover:bg-theme-border"
                    >
                      {t('bookmarks.retakeExam')}
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </main>
      </div>
    </PageTransition>
  )
}
