import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useExamStore from '../store/examStore'
import useTimer from '../hooks/useTimer'
import Timer from '../components/exam/Timer'
import ProgressBar from '../components/exam/ProgressBar'
import QuestionCard from '../components/exam/QuestionCard'
import Spinner from '../components/ui/Spinner'
import PageTransition from '../components/ui/PageTransition'

const slideVariants = {
  initial: (dir) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
}

export default function Exam() {
  const { testId } = useParams()
  const navigate = useNavigate()

  const loading = useExamStore(s => s.loading)
  const error = useExamStore(s => s.error)
  const questions = useExamStore(s => s.questions)
  const currentIndex = useExamStore(s => s.currentIndex)
  const answers = useExamStore(s => s.answers)
  const completed = useExamStore(s => s.completed)
  const sessionId = useExamStore(s => s.sessionId)
  const testMeta = useExamStore(s => s.testMeta)
  const startExam = useExamStore(s => s.startExam)
  const answerQuestion = useExamStore(s => s.answerQuestion)
  const answerSubQuestion = useExamStore(s => s.answerSubQuestion)
  const nextQuestion = useExamStore(s => s.nextQuestion)
  const prevQuestion = useExamStore(s => s.prevQuestion)
  const goToQuestion = useExamStore(s => s.goToQuestion)
  const completeExam = useExamStore(s => s.completeExam)
  const reset = useExamStore(s => s.reset)

  const [direction, setDirection] = useState(0)

  useTimer()

  // Start exam on mount
  useEffect(() => {
    startExam(testId, 'exam')
    return () => reset()
  }, [testId, startExam, reset])

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

  const allAnswered = questions.every(q => {
    if (q.type === 'standard') return answers[q.id] !== undefined
    return q.sub_questions.every(sq => answers[sq.id] !== undefined)
  })

  return (
    <PageTransition>
      <div className="min-h-screen bg-bg px-4 py-6">
        <div className="mx-auto max-w-3xl">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline">
              <span className="text-xs text-text-secondary">問題</span>
              <span className="text-xl font-bold text-text-primary ml-1">{current}</span>
              <span className="text-sm text-text-secondary ml-0.5">/ {total}</span>
            </div>
            <Timer />
          </div>

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

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="rounded-lg bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-theme-border disabled:opacity-30"
            >
              前の問題
            </button>

            {/* Question number grid */}
            <div className="hidden sm:grid flex-wrap justify-center gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, 2rem)' }}>
              {questions.map((q, i) => {
                const answered = q.type === 'standard'
                  ? answers[q.id] !== undefined
                  : q.sub_questions.some(sq => answers[sq.id] !== undefined)
                const isCurrent = i === currentIndex
                return (
                  <button
                    key={q.id}
                    onClick={() => handleGoTo(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
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
                onClick={completeExam}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover"
              >
                {allAnswered ? '提出する' : '提出する（未回答あり）'}
              </button>
            ) : (
              <button
                onClick={isScenario ? handleScenarioCheck : handleNext}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                次の問題
              </button>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
