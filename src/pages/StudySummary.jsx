import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'
import ScoreCard from '../components/exam/ScoreCard'
import Spinner from '../components/ui/Spinner'
import PageTransition from '../components/ui/PageTransition'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import { useI18n } from '../lib/i18n'

function buildStudyCoach({ session, test, stats, t }) {
  const score = session.score ?? 0
  const passScore = test.pass_score ?? 45
  const totalPoints = test.total_points ?? 50
  const wrongCount = stats?.wrongCount ?? 0
  const unansweredCount = stats?.unansweredCount ?? 0
  const passed = score >= passScore

  if (passed && wrongCount <= 3 && unansweredCount === 0) {
    return {
      title: t('study.readyToTryExam'),
      summary: t('study.readyToTryExamSummary', { score, total: totalPoints }),
      primary: t('study.challengeExam'),
      primaryTo: `/exam/${test.id}`,
      secondary: t('study.reviewTips'),
      secondaryTo: '/tips',
      tone: 'border-correct/30 bg-correct/10',
    }
  }

  if (passed) {
    return {
      title: t('study.goodProgress'),
      summary: t('study.goodProgressSummary', { count: wrongCount }),
      primary: t('study.studyAgain'),
      primaryTo: `/study/${test.id}`,
      secondary: t('study.tryExamMode'),
      secondaryTo: `/exam/${test.id}`,
      tone: 'border-warning/30 bg-warning/10',
    }
  }

  return {
    title: t('study.reviewBeforeExamMode'),
    summary: t('study.reviewBeforeExamModeSummary', { score, total: totalPoints }),
    primary: t('study.studyAgain'),
    primaryTo: `/study/${test.id}`,
    secondary: t('study.readTips'),
    secondaryTo: '/tips',
    tone: 'border-wrong/30 bg-wrong/10',
  }
}

function StudyCoach({ coach }) {
  const { t } = useI18n()

  return (
    <section className={`mt-6 rounded-xl border p-4 shadow-sm sm:p-5 ${coach.tone}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t('study.coaching')}</p>
      <h2 className="mt-1 text-xl font-bold text-text-primary">{coach.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{coach.summary}</p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          as={Link}
          to={coach.primaryTo}
          className="rounded-lg"
        >
          {coach.primary}
        </Button>
        <Button
          as={Link}
          to={coach.secondaryTo}
          variant="outline"
          className="rounded-lg"
        >
          {coach.secondary}
        </Button>
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
      const { data: testData } = await supabase
        .from('tests')
        .select('*')
        .eq('id', sess.test_id)
        .single()

      if (!testData) {
        setError(t('study.summaryTestLoadError'))
        setLoading(false)
        return
      }

      setTest(testData)

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
        setError(t('study.summaryAnswerLoadError'))
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
          <Breadcrumbs items={[{ label: t('study.completed') }]} />
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

          <StudyCoach coach={buildStudyCoach({ session, test, stats, t })} />

          {/* CTAs */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <Button
              as={Link}
              to={`/exam/${testId}`}
              className="w-full max-w-xs"
            >
              {t('study.challengeExam')}
            </Button>
            <Button
              as={Link}
              to={`/study/${testId}`}
              variant="outline"
              className="w-full max-w-xs"
            >
              {t('study.studyAgain')}
            </Button>
            <Button
              as={Link}
              to="/"
              variant="ghost"
              size="sm"
              className="mt-1"
            >
              {t('common.backHome')}
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
