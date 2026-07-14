import { useEffect, useRef, useState } from 'react'
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
import Button from '../components/ui/Button'
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
  const [autoAdvancing, setAutoAdvancing] = useState(false)
  const touchStartX = useRef(null)

  useTimer()

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) || target?.isContentEditable
      if (isTyping || loading || confirmSubmit || questions.length === 0) return

      const lastIndex = questions.length - 1

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        if (currentIndex > 0) {
          setDirection(-1)
          prevQuestion()
        }
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        if (currentIndex < lastIndex) {
          setDirection(1)
          nextQuestion()
        }
      } else if (/^[1-9]$/.test(event.key) && !isSimulation) {
        const index = Number(event.key) - 1
        if (index < questions.length) {
          event.preventDefault()
          setDirection(index > currentIndex ? 1 : -1)
          goToQuestion(index)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [confirmSubmit, currentIndex, goToQuestion, isSimulation, loading, nextQuestion, prevQuestion, questions.length])

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
        <div className="rounded-md bg-wrong/10 p-4 text-sm text-wrong">{error}</div>
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
      setAutoAdvancing(!isLast)
      // Auto-advance after short delay for standard questions
      setTimeout(() => {
        setAutoAdvancing(false)
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

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current
    touchStartX.current = null

    if (Math.abs(delta) < 50) return
    if (delta > 0 && currentIndex > 0) {
      handlePrev()
    } else if (delta < 0 && !isLast) {
      handleNext()
    }
  }

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col bg-bg">
        {/* Scrollable content area */}
        <div
          className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="mx-auto max-w-3xl">
            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h1 className="flex items-baseline">
                <span className="text-xs text-text-secondary">
                  {isSimulation ? t('exam.simulationLabel') : t('common.question')}
                </span>
                <span className="num ml-1 text-2xl font-extrabold text-text-primary">{current}</span>
                <span className="text-sm text-text-secondary ml-0.5">/ {total}</span>
              </h1>
              <Timer />
            </div>

            {isSimulation && (
              <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-text-primary">
                {t('exam.simulationHelp')}
              </div>
            )}

            {autoAdvancing && (
              <div className="mb-4 rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
                {t('exam.autoAdvancing')}
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
        <div className="shrink-0 border-t border-theme-border bg-surface/95 px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-4">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-between">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              variant="secondary"
              className="rounded-lg disabled:opacity-30 sm:px-4"
            >
              {t('exam.previousQuestion')}
            </Button>

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
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="sm:px-6"
              >
                {allAnswered ? t('exam.submit') : t('exam.submitWithUnanswered')}
              </Button>
            ) : (
              <Button
                onClick={isScenario ? handleScenarioCheck : handleNext}
                className="rounded-lg sm:px-4"
              >
                {t('exam.nextQuestion')}
              </Button>
            )}
          </div>
          {submitError && (
            <div className="mx-auto mt-3 flex max-w-3xl items-center justify-between gap-3 rounded-xl border border-wrong/20 bg-wrong/10 px-3 py-2 text-sm text-wrong">
              <span>{submitError}</span>
              <Button
                onClick={completeExam}
                disabled={submitting}
                variant="danger"
                size="sm"
                className="shrink-0 rounded-lg"
              >
                {t('common.retry')}
              </Button>
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
