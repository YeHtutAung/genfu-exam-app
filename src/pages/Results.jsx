import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ScoreCard from '../components/exam/ScoreCard'
import ImageRenderer from '../components/signs/ImageRenderer'
import Spinner from '../components/ui/Spinner'
import PageTransition from '../components/ui/PageTransition'
import StaggerList from '../components/ui/StaggerList'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { useI18n } from '../lib/i18n'

function buildResultCoach({ session, test, wrongCount, unansweredCount, timeTaken, t }) {
  const score = session.score ?? 0
  const totalPoints = test?.total_points ?? 50
  const passScore = test?.pass_score ?? 45
  const timeLimit = test?.time_limit ?? 1800
  const scorePercent = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0
  const margin = score - passScore
  const nearPass = margin >= 0 && margin <= 2
  const closeFail = margin < 0 && margin >= -5
  const slowAttempt = timeTaken > 0 && timeTaken >= timeLimit * 0.9
  const fastAttempt = timeTaken > 0 && timeTaken <= timeLimit * 0.45 && wrongCount > 0

  if (session.passed && !nearPass && wrongCount <= 3 && unansweredCount === 0) {
    return {
      title: t('exam.strongPass'),
      tone: 'border-correct/30 bg-correct/10',
      summary: t('exam.strongPassSummary'),
      priority: t('exam.strongPassPriority'),
      actions: [t('exam.takeAnotherTimedExam'), t('exam.reviewMissedOnce')],
      primary: t('exam.takeAnotherExam'),
      primaryTo: `/exam/${session.test_id}`,
    }
  }

  if (session.passed) {
    return {
      title: nearPass ? t('exam.passedClose') : t('exam.passedReviewNeeded'),
      tone: 'border-warning/30 bg-warning/10',
      summary: nearPass
        ? t('exam.passedByPoints', { count: margin })
        : t('exam.passedWithMisses', { percent: scorePercent, count: wrongCount }),
      priority: t('exam.reviewMissedThenPass'),
      actions: [
        t('exam.studyIncorrectQuestions'),
        slowAttempt ? t('exam.practicePacing') : t('exam.retakeForConsistency'),
      ],
      primary: t('exam.reviewStudy'),
      primaryTo: `/study/${session.test_id}`,
    }
  }

  if (unansweredCount > 0) {
    return {
      title: t('exam.unansweredCost'),
      tone: 'border-wrong/30 bg-wrong/10',
      summary: t('exam.unansweredCostSummary', { count: unansweredCount }),
      priority: t('exam.answerEveryQuestion'),
      actions: [
        t('exam.practiceFullCompletion'),
        t('exam.eliminateUnsafe'),
      ],
      primary: t('exam.retake'),
      primaryTo: `/exam/${session.test_id}`,
    }
  }

  if (closeFail) {
    return {
      title: t('exam.closeToPassing'),
      tone: 'border-warning/30 bg-warning/10',
      summary: t('exam.missedByPoints', { count: Math.abs(margin) }),
      priority: t('exam.studyWrongThenRetake'),
      actions: [
        t('exam.reviewWrongUntilClear'),
        fastAttempt ? t('exam.slowDownReadCarefully') : t('exam.retakeToday'),
      ],
      primary: t('exam.studyWrongAreas'),
      primaryTo: `/study/${session.test_id}`,
    }
  }

  return {
    title: t('exam.needsFocusedPractice'),
    tone: 'border-wrong/30 bg-wrong/10',
    summary: t('exam.scoredReviewFirst', { score, total: totalPoints }),
    priority: t('exam.useStudyBeforeRetake'),
    actions: [
      t('exam.reviewIncorrectAnswers'),
      t('exam.repeatInStudyMode'),
      t('exam.retakeAfterReview'),
    ],
    primary: t('exam.startReview'),
    primaryTo: `/study/${session.test_id}`,
  }
}

function ResultCoach({ coach }) {
  const { t } = useI18n()

  return (
    <section className={`mt-6 rounded-xl border p-4 shadow-sm sm:p-5 ${coach.tone}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t('exam.resultCoaching')}</p>
          <h2 className="mt-1 text-xl font-bold text-text-primary">{coach.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-primary">{coach.summary}</p>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">{coach.priority}</p>
        </div>
        <Button
          as={Link}
          to={coach.primaryTo}
          className="shrink-0 rounded-lg"
        >
          {coach.primary}
        </Button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {coach.actions.map(action => (
          <Card key={action} className="rounded-lg bg-bg/80 p-3 text-sm text-text-secondary">
            {action}
          </Card>
        ))}
      </div>
    </section>
  )
}

export default function Results() {
  const { t } = useI18n()
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answerMap, setAnswerMap] = useState({})  // { questionId: boolean, subQuestionId: boolean }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wrongOnly, setWrongOnly] = useState(false)

  useEffect(() => {
    async function load() {
      // Fetch session
      const { data: sess, error: sErr } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sErr) { setError(sErr.message); setLoading(false); return }
      setSession(sess)

      // Fetch test meta
      const { data: t } = await supabase
        .from('tests')
        .select('*')
        .eq('id', sess.test_id)
        .single()
      setTest(t)

      // Fetch questions with sub_questions
      const { data: qs } = await supabase
        .from('questions')
        .select('*, sub_questions(*)')
        .eq('test_id', sess.test_id)
        .order('question_number')

      const sorted = (qs || []).map(q => ({
        ...q,
        sub_questions: (q.sub_questions || []).sort((a, b) => a.sub_number - b.sub_number),
        image: q.image_render
          ? { render: q.image_render, sign_code: q.sign_code, src: q.image_url, alt: q.image_alt }
          : null,
      }))
      setQuestions(sorted)

      // Fetch answers for this session
      const { data: ans } = await supabase
        .from('answers')
        .select('*')
        .eq('session_id', sessionId)

      const map = {}
      for (const a of ans || []) {
        const key = a.sub_question_id || a.question_id
        map[key] = { user_answer: a.user_answer, is_correct: a.is_correct }
      }
      setAnswerMap(map)

      setLoading(false)
    }
    load()
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-md bg-wrong/10 p-4 text-sm text-wrong">{error}</div>
      </div>
    )
  }

  // Calculate time taken
  const timeTaken = session.completed_at && session.started_at
    ? Math.round((new Date(session.completed_at) - new Date(session.started_at)) / 1000)
    : 0

  // Compute stat counts from answer data
  let correctCount = 0
  let wrongCount = 0
  let unansweredCount = 0

  for (const q of questions) {
    if (q.type === 'standard') {
      const a = answerMap[q.id]
      if (!a || a.user_answer === null || a.user_answer === undefined) {
        unansweredCount++
      } else if (a.is_correct) {
        correctCount++
      } else {
        wrongCount++
      }
    } else {
      // Scenario: count each sub_question individually
      for (const sq of q.sub_questions) {
        const a = answerMap[sq.id]
        if (!a || a.user_answer === null || a.user_answer === undefined) {
          unansweredCount++
        } else if (a.is_correct) {
          correctCount++
        } else {
          wrongCount++
        }
      }
    }
  }

  // Filter questions for review
  const isQuestionWrong = (q) => {
    if (q.type === 'standard') {
      const a = answerMap[q.id]
      return !a || !a.is_correct
    }
    // Scenario: wrong if any sub_question wrong
    return q.sub_questions.some(sq => {
      const a = answerMap[sq.id]
      return !a || !a.is_correct
    })
  }

  const displayQuestions = wrongOnly
    ? questions.filter(isQuestionWrong)
    : questions
  const coach = buildResultCoach({
    session,
    test,
    wrongCount,
    unansweredCount,
    timeTaken,
    t,
  })

  return (
    <PageTransition>
      <div className="min-h-screen bg-bg px-3 py-6 sm:px-4">
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs items={[{ label: t('exam.reviewTitle') }]} />
          <ScoreCard
            score={session.score ?? 0}
            totalPoints={test?.total_points ?? 50}
            passScore={test?.pass_score ?? 45}
            passed={session.passed ?? false}
            timeTaken={timeTaken}
            testId={session.test_id}
            correctCount={correctCount}
            wrongCount={wrongCount}
            unansweredCount={unansweredCount}
          />

          <ResultCoach coach={coach} />

          {/* Actions */}
          <div className="mt-6 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
            <Button
              as={Link}
              to={`/exam/${session.test_id}`}
              className="rounded-md sm:py-2"
            >
              {t('exam.retake')}
            </Button>
            <Button
              as={Link}
              to={`/study/${session.test_id}`}
              variant="secondary"
              className="rounded-md sm:py-2"
            >
              {t('exam.reviewStudy')}
            </Button>
            <Button
              as={Link}
              to="/"
              variant="secondary"
              className="rounded-md sm:py-2"
            >
              {t('common.backHome')}
            </Button>
          </div>

          {/* Review section */}
          <div className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-text-primary">{t('exam.reviewTitle')}</h2>
              <Button
                onClick={() => setWrongOnly(!wrongOnly)}
                variant="secondary"
                size="sm"
                className={`rounded-full ${
                  wrongOnly
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text-secondary'
                }`}
              >
                {wrongOnly ? t('exam.showingWrongOnly') : t('exam.wrongOnly')}
              </Button>
            </div>

            <StaggerList className="space-y-3">
              {displayQuestions.map(q => (
                <ReviewItem key={q.id} question={q} answerMap={answerMap} />
              ))}
            </StaggerList>

            {wrongOnly && displayQuestions.length === 0 && (
              <p className="py-8 text-center text-text-secondary">{t('exam.allCorrect')}</p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

function ReviewItem({ question, answerMap }) {
  const { t, field } = useI18n()
  const isScenario = question.type === 'scenario'
  const hint = field(question, 'hint')

  if (isScenario) {
    const allCorrect = question.sub_questions.every(sq => answerMap[sq.id]?.is_correct)
    return (
      <Card>
        <div className="flex items-start gap-3">
          <Badge tone={allCorrect ? 'correct' : 'wrong'} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full px-0 py-0 text-sm font-bold">
            {allCorrect ? '○' : '×'}
          </Badge>
          <div className="min-w-0 flex-1">
            <Badge tone="ai" className="mb-1 rounded">
              {t('exam.dangerScenario')} ({question.points}{t('common.points')})
            </Badge>
            <p className="text-sm text-text-primary mt-1 font-jp">{field(question, 'question')}</p>

            {question.image && (
              <div className="my-2">
                <ImageRenderer image={question.image} />
              </div>
            )}

            <div className="mt-2 space-y-1">
              {question.sub_questions.map(sq => {
                const a = answerMap[sq.id]
                return (
                  <div key={sq.id} className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={a?.is_correct ? 'text-correct font-semibold' : 'text-wrong font-semibold'}>
                      {a?.is_correct ? '○' : '×'}
                    </span>
                    <span className="text-text-secondary">({sq.sub_number})</span>
                    <span className="text-text-primary">{field(sq, 'text')}</span>
                    <span className="text-text-secondary sm:ml-auto">
                      {t('common.yourAnswer')}: {a?.user_answer === true ? '○' : a?.user_answer === false ? '×' : '—'}
                      {' '}/ {t('common.correct')}: {sq.answer ? '○' : '×'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Standard question
  const a = answerMap[question.id]
  const correct = a?.is_correct

  return (
    <Card>
        <div className="flex items-start gap-3">
          <Badge tone={correct ? 'correct' : 'wrong'} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full px-0 py-0 text-sm font-bold">
            {correct ? '○' : '×'}
          </Badge>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-primary font-jp">
            <span className="font-medium text-text-secondary">{t('common.questionShort')}{question.question_number}.</span>{' '}
            {field(question, 'question')}
          </p>

          {question.image && (
            <div className="my-2">
              <ImageRenderer image={question.image} />
            </div>
          )}

          <div className="mt-1 flex flex-wrap gap-2 text-xs sm:gap-4">
            <span className={a?.user_answer === question.answer ? 'text-correct font-semibold' : 'text-wrong font-semibold'}>
              {t('common.yourAnswer')}: {a?.user_answer === true ? '○' : a?.user_answer === false ? '×' : t('exam.unansweredAnswer')}
            </span>
            <span className="text-text-secondary">
              {t('common.correct')}: {question.answer ? '○' : '×'}
            </span>
          </div>

          {!correct && hint && (
            <p className="mt-1 text-xs text-primary">{hint}</p>
          )}
        </div>
      </div>
    </Card>
  )
}
