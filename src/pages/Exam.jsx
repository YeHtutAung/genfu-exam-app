import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useExamStore from '../store/examStore'
import useTimer from '../hooks/useTimer'
import Timer from '../components/exam/Timer'
import ProgressBar from '../components/exam/ProgressBar'
import QuestionCard from '../components/exam/QuestionCard'
import Spinner from '../components/ui/Spinner'
import PageTransition from '../components/ui/PageTransition'
import Modal from '../components/ui/Modal'
import { useI18n } from '../lib/i18n'

const slideVariants = {
  initial: (dir) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
}

export default function Exam() {
  const { t } = useI18n()
  const { testId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isSimulation = location.pathname.startsWith('/simulation/')

  const loading = useExamStore(s => s.loading)
  const error = useExamStore(s => s.error)
  const questions = useExamStore(s => s.questions)
  const currentIndex = useExamStore(s => s.currentIndex)
  const answers = useExamStore(s => s.answers)
  const completed = useExamStore(s => s.completed)
  const submitting = useExamStore(s => s.submitting)
  const submitError = useExamStore(s => s.submitError)
  const sessionId = useExamStore(s => s.sessionId)
  const startExam = useExamStore(s => s.startExam)
  const answerQuestion = useExamStore(s => s.answerQuestion)
  const answerSubQuestion = useExamStore(s => s.answerSubQuestion)
  const nextQuestion = useExamStore(s => s.nextQuestion)
  const prevQuestion = useExamStore(s => s.prevQuestion)
  const goToQuestion = useExamStore(s => s.goToQuestion)
  const completeExam = useExamStore(s => s.completeExam)
  const reset = useExamStore(s => s.reset)

  const [direction, setDirection] = useState(0)
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  useTimer()

  // Start exam on mount
  useEffect(() => {
    startExam(testId, 'exam', { variant: isSimulation ? 'simulation' : 'standard' })
    return () => reset()
  }, [testId, startExam, reset, isSimulation])

  // Navigate to results when completed
  useEffect(() => {
    if (completed && sessionId) {
      navigate(`/results/${sessionId}`, { replace: true })
    }
  }, [completed, sessionId, navigate])

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
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      </div>
    )
  }

  if (questions.length === 0) return null

  const question = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const isScenario = question.type === 'scenario'
  const total = questions.length
  const current = currentIndex + 1

  // Get user answer for current question
  const userAnswer = isScenario
    ? question.sub_questions.reduce((acc, sq) => {
        if (answers[sq.id] !== undefined) acc[sq.id] = answers[sq.id]
        return acc
      }, {})
    : answers[question.id]

  const handleAnswer = (id, answer) => {
    if (isScenario) {
      answerSubQuestion(id, answer)
    } else {
      answerQuestion(id, answer)
      // Auto-advance after short delay for standard questions
      setTimeout(() => {
        if (!isLast) {
          setDirection(1)
          nextQuestion()
        }
      }, 300)
    }
  }

  // For scenario: advance when all sub_questions answered
  const handleScenarioCheck = () => {
    if (!isLast) {
      setDirection(1)
      nextQuestion()
    }
  }

  const handleNext = () => {
    setDirection(1)
    nextQuestion()
  }

  const handlePrev = () => {
    setDirection(-1)
    prevQuestion()
  }

  const handleGoTo = (i) => {
    setDirection(i > currentIndex ? 1 : -1)
    goToQuestion(i)
  }

  const unansweredCount = questions.reduce((count, q) => {
    if (q.type === 'standard') {
      return answers[q.id] === undefined ? count + 1 : count
    }
    return count + q.sub_questions.filter(sq => answers[sq.id] === undefined).length
  }, 0)

  const allAnswered = unansweredCount === 0

  const handleSubmit = async () => {
    if (!allAnswered) {
      setConfirmSubmit(true)
      return
    }
    await completeExam()
  }

  const handleConfirmedSubmit = async () => {
    setConfirmSubmit(false)
    await completeExam()
  }

  return (
    <PageTransition>
      <div className="flex min-h-[calc(100dvh-4rem)] flex-col bg-bg">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
          <div className="mx-auto max-w-3xl">
            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-baseline">
                <span className="text-xs text-text-secondary">
                  {isSimulation ? 'Real exam simulation' : t('common.question')}
                </span>
                <span className="text-xl font-bold text-text-primary ml-1">{current}</span>
                <span className="text-sm text-text-secondary ml-0.5">/ {total}</span>
              </div>
              <Timer />
            </div>

            {isSimulation && (
              <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-text-primary">
                No hints, no review until submit, randomized order. Treat this like the real test.
              </div>
            )}

            {/* Progress bar */}
            <div className="mb-4">
              <ProgressBar />
            </div>

            {/* Question with slide animation */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <QuestionCard
                  question={question}
                  onAnswer={handleAnswer}
                  showResult={false}
                  userAnswer={userAnswer}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Fixed bottom navigation */}
        <div className="shrink-0 border-t border-theme-border bg-bg/95 px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-4">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="min-h-11 rounded-lg bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-theme-border disabled:opacity-30 sm:px-4"
            >
              {t('exam.previousQuestion')}
            </button>

            {/* Question number grid */}
            <div className={`order-3 col-span-2 hidden flex-wrap justify-center gap-1 sm:order-none sm:flex sm:flex-1 sm:mx-4 sm:max-h-28 sm:overflow-y-auto ${isSimulation ? 'sm:hidden' : ''}`}>
              {questions.map((q, i) => {
                const answered = q.type === 'standard'
                  ? answers[q.id] !== undefined
                  : q.sub_questions.some(sq => answers[sq.id] !== undefined)
                const isCurrent = i === currentIndex
                return (
                  <button
                    key={q.id}
                    onClick={() => handleGoTo(i)}
                    className={`h-9 w-9 rounded-lg text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-primary text-white shadow-sm'
                        : answered
                          ? 'bg-primary/10 text-primary'
                          : 'bg-surface text-text-secondary'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="min-h-11 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover disabled:opacity-50 sm:px-6"
              >
                {allAnswered ? t('exam.submit') : t('exam.submitWithUnanswered')}
              </button>
            ) : (
              <button
                onClick={isScenario ? handleScenarioCheck : handleNext}
                className="min-h-11 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:px-4"
              >
                {t('exam.nextQuestion')}
              </button>
            )}
          </div>
          {submitError && (
            <div className="mx-auto mt-3 flex max-w-3xl items-center justify-between gap-3 rounded-xl border border-wrong/20 bg-wrong/10 px-3 py-2 text-sm text-wrong">
              <span>{submitError}</span>
              <button
                onClick={completeExam}
                disabled={submitting}
                className="min-h-10 shrink-0 rounded-lg bg-wrong px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {t('common.retry')}
              </button>
            </div>
          )}
        </div>
      </div>
      <Modal
        isOpen={confirmSubmit}
        title={t('exam.unansweredTitle')}
        message={t('exam.unansweredMessage', { count: unansweredCount })}
        confirmLabel={t('exam.submit')}
        cancelLabel={t('common.back')}
        onConfirm={handleConfirmedSubmit}
        onCancel={() => setConfirmSubmit(false)}
      />
    </PageTransition>
  )
}
