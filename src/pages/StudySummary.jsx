import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'
import ScoreCard from '../components/exam/ScoreCard'
import Spinner from '../components/ui/Spinner'
import PageTransition from '../components/ui/PageTransition'

export default function StudySummary() {
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
        setError('データが見つかりません')
        setLoading(false)
        return
      }

      // Validate: must be a study session belonging to current user, matching the URL testId
      if (sess.mode !== 'study' || sess.user_id !== user?.id || sess.test_id !== testId) {
        setError('データが見つかりません')
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
      setTest(t)

      // Fetch questions to compute stats
      const { data: qs } = await supabase
        .from('questions')
        .select('*, sub_questions(*)')
        .eq('test_id', sess.test_id)
        .order('question_number')

      // Fetch answers
      const { data: ans } = await supabase
        .from('answers')
        .select('*')
        .eq('session_id', sessionId)

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
  }, [sessionId, user?.id])

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
            <p className="text-text-secondary">{error || 'データが見つかりません'}</p>
            <Link to="/" className="mt-4 inline-block text-primary hover:text-primary-hover text-sm font-medium">
              ホームに戻る
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
            correctCount={stats.correctCount}
            wrongCount={stats.wrongCount}
            unansweredCount={stats.unansweredCount}
            hideTimeTaken
            hideCtas
            mode="study"
          />

          {/* CTAs */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              to={`/exam/${testId}`}
              className="w-full max-w-xs rounded-xl bg-primary py-2.5 text-sm font-semibold text-white text-center shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover"
            >
              試験モードに挑戦
            </Link>
            <Link
              to={`/study/${testId}`}
              className="w-full max-w-xs rounded-xl bg-surface border border-theme-border py-2.5 text-sm font-medium text-text-secondary text-center transition-colors hover:bg-theme-border"
            >
              もう一度学習
            </Link>
            <Link
              to="/"
              className="text-primary text-sm font-medium hover:text-primary-hover mt-1"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
