import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'
import ScoreCard from '../components/exam/ScoreCard'
import Spinner from '../components/ui/Spinner'
import PageTransition from '../components/ui/PageTransition'
import { useI18n } from '../lib/i18n'

function buildStudyCoach({ session, test, stats }) {
  const score = session.score ?? 0
  const passScore = test.pass_score ?? 45
  const totalPoints = test.total_points ?? 50
  const wrongCount = stats?.wrongCount ?? 0
  const unansweredCount = stats?.unansweredCount ?? 0
  const passed = score >= passScore

  if (passed && wrongCount <= 3 && unansweredCount === 0) {
    return {
      title: 'Ready to try exam mode',
      summary: `You scored ${score}/${totalPoints} in study mode. Move to timed exam mode while the material is fresh.`,
      primary: 'Challenge exam mode',
      primaryTo: `/exam/${test.id}`,
      secondary: 'Review tips',
      secondaryTo: '/tips',
      tone: 'border-correct/30 bg-correct/10',
    }
  }

  if (passed) {
    return {
      title: 'Good progress',
      summary: `You reached the pass line, but ${wrongCount} answer${wrongCount === 1 ? '' : 's'} still need review before exam mode feels stable.`,
      primary: 'Study again',
      primaryTo: `/study/${test.id}`,
      secondary: 'Try exam mode',
      secondaryTo: `/exam/${test.id}`,
      tone: 'border-warning/30 bg-warning/10',
    }
  }

  return {
    title: 'Review before exam mode',
    summary: `You scored ${score}/${totalPoints}. Stay in study mode until the wrong answers make sense.`,
    primary: 'Study again',
    primaryTo: `/study/${test.id}`,
    secondary: 'Read tips',
    secondaryTo: '/tips',
    tone: 'border-wrong/30 bg-wrong/10',
  }
}

function StudyCoach({ coach }) {
  return (
    <section className={`mt-6 rounded-xl border p-4 shadow-sm sm:p-5 ${coach.tone}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Study coaching</p>
      <h2 className="mt-1 text-xl font-bold text-text-primary">{coach.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{coach.summary}</p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Link
          to={coach.primaryTo}
          className="min-h-11 rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          {coach.primary}
        </Link>
        <Link
          to={coach.secondaryTo}
          className="min-h-11 rounded-lg bg-bg px-4 py-3 text-center text-sm font-semibold text-text-secondary transition-colors hover:bg-surface"
        >
          {coach.secondary}
        </Link>
      </div>
    </section>
  )
}

export default function StudySummary() {
  const { t } = useI18n()
  const { testId, sessionId } = useParams()
  const user = useAuthStore(s => s.user)
  const [session, setSession] = useState(null)
  const [test, setTest] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      // Fetch session
      const { data: sess, error: sErr } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sErr || !sess) {
        setError(t('common.noData'))
        setLoading(false)
        return
      }

      // Validate: must be a study session belonging to current user, matching the URL testId
      if (sess.mode !== 'study' || sess.user_id !== user?.id || sess.test_id !== testId) {
        setError(t('common.noData'))
        setLoading(false)
        return
      }

      setSession(sess)

      // Fetch test meta
      const { data: t } = await supabase
        .from('tests')
        .select('*')
        .eq('id', sess.test_id)
        .single()

      if (!t) {
        setError('Study summary could not load the test data.')
        setLoading(false)
        return
      }

      setTest(t)

      // Fetch questions to compute stats
      const { data: qs, error: qErr } = await supabase
        .from('questions')
        .select('*, sub_questions(*)')
        .eq('test_id', sess.test_id)
        .order('question_number')

      // Fetch answers
      const { data: ans, error: aErr } = await supabase
        .from('answers')
        .select('*')
        .eq('session_id', sessionId)

      if (qErr || aErr) {
        setError('Study summary could not load answer data.')
        setLoading(false)
        return
      }

      const answerMap = {}
      for (const a of ans || []) {
        const key = a.sub_question_id || a.question_id
        answerMap[key] = { user_answer: a.user_answer, is_correct: a.is_correct }
      }

      // Compute counts
      let correctCount = 0
      let wrongCount = 0
      let unansweredCount = 0

      for (const q of qs || []) {
        if (q.type === 'standard') {
          const a = answerMap[q.id]
          if (!a || a.user_answer === null || a.user_answer === undefined) unansweredCount++
          else if (a.is_correct) correctCount++
          else wrongCount++
        } else {
          for (const sq of q.sub_questions || []) {
            const a = answerMap[sq.id]
            if (!a || a.user_answer === null || a.user_answer === undefined) unansweredCount++
            else if (a.is_correct) correctCount++
            else wrongCount++
          }
        }
      }

      setStats({ correctCount, wrongCount, unansweredCount })
      setLoading(false)
    }
    load()
  }, [sessionId, testId, user?.id, t])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (error || !session || !test) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-bg px-4 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-text-secondary">{error || t('common.noData')}</p>
            <Link to="/" className="mt-4 inline-block text-primary hover:text-primary-hover text-sm font-medium">
              {t('common.backHome')}
            </Link>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-bg px-4 py-6">
        <div className="mx-auto max-w-3xl">
          <ScoreCard
            score={session.score ?? 0}
            totalPoints={test.total_points ?? 50}
            passScore={test.pass_score ?? 45}
            passed={session.passed ?? false}
            timeTaken={0}
            correctCount={stats?.correctCount}
            wrongCount={stats?.wrongCount}
            unansweredCount={stats?.unansweredCount}
            hideTimeTaken
            hideCtas
            mode="study"
          />

          <StudyCoach coach={buildStudyCoach({ session, test, stats })} />

          {/* CTAs */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              to={`/exam/${testId}`}
              className="w-full max-w-xs rounded-xl bg-primary py-2.5 text-sm font-semibold text-white text-center shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover"
            >
              {t('study.challengeExam')}
            </Link>
            <Link
              to={`/study/${testId}`}
              className="w-full max-w-xs rounded-xl bg-surface border border-theme-border py-2.5 text-sm font-medium text-text-secondary text-center transition-colors hover:bg-theme-border"
            >
              {t('study.studyAgain')}
            </Link>
            <Link
              to="/"
              className="text-primary text-sm font-medium hover:text-primary-hover mt-1"
            >
              {t('common.backHome')}
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
