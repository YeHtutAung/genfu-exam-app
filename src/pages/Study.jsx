import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useExamStore from '../store/examStore'
import StudyCard from '../components/study/StudyCard'
import Spinner from '../components/ui/Spinner'
import PageTransition from '../components/ui/PageTransition'

const slideVariants = {
  initial: (dir) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
}

export default function Study() {
  const { testId } = useParams()
  const navigate = useNavigate()

  const loading = useExamStore(s => s.loading)
  const error = useExamStore(s => s.error)
  const questions = useExamStore(s => s.questions)
  const currentIndex = useExamStore(s => s.currentIndex)
  const answers = useExamStore(s => s.answers)
  const testMeta = useExamStore(s => s.testMeta)
  const startExam = useExamStore(s => s.startExam)
  const answerQuestion = useExamStore(s => s.answerQuestion)
  const answerSubQuestion = useExamStore(s => s.answerSubQuestion)
  const nextQuestion = useExamStore(s => s.nextQuestion)
  const prevQuestion = useExamStore(s => s.prevQuestion)
  const reset = useExamStore(s => s.reset)
  const completeExam = useExamStore(s => s.completeExam)
  const sessionId = useExamStore(s => s.sessionId)

  // Key to force StudyCard remount when question changes
  const [cardKey, setCardKey] = useState(0)
  const [direction, setDirection] = useState(0)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    startExam(testId, 'study')
    return () => reset()
  }, [testId, startExam, reset])

  // Reset card key when question changes
  useEffect(() => {
    setCardKey(k => k + 1)
  }, [currentIndex])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
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
  const isScenario = question.type === 'scenario'
  const current = currentIndex + 1
  const total = questions.length

  // Build userAnswer for current question
  const userAnswer = isScenario
    ? question.sub_questions.reduce((acc, sq) => {
        if (answers[sq.id] !== undefined) acc[sq.id] = answers[sq.id]
        return acc
      }, {})
    : answers[question.id] !== undefined
      ? { value: answers[question.id] }
      : undefined

  const handleAnswer = (id, answer) => {
    if (isScenario) {
      answerSubQuestion(id, answer)
    } else {
      answerQuestion(id, answer)
    }
  }

  // Check if all questions have been answered
  const allAnswered = questions.length > 0 && questions.every(q => {
    if (q.type === 'standard') {
      return answers[q.id] !== undefined
    }
    // Scenario: all sub_questions must be answered
    return q.sub_questions.every(sq => answers[sq.id] !== undefined)
  })

  const handleComplete = async () => {
    // Capture sessionId before unmount triggers reset(); testId is from useParams() so it's stable
    const capturedSessionId = sessionId
    setCompleting(true)
    await completeExam()
    navigate(`/study/${testId}/summary/${capturedSessionId}`)
  }

  const handlePrev = () => {
    setDirection(-1)
    prevQuestion()
  }

  const handleNext = () => {
    setDirection(1)
    nextQuestion()
  }

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-bg">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-3xl">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline">
                <span className="text-xs text-text-secondary">学習モード</span>
                <span className="text-xl font-bold text-text-primary ml-1">問 {current}</span>
                <span className="text-sm text-text-secondary ml-0.5">/ {total}</span>
              </div>
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                📖 学習中
              </span>
            </div>

            {/* Animated question card */}
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
                <StudyCard
                  key={cardKey}
                  question={question}
                  onAnswer={handleAnswer}
                  userAnswer={userAnswer}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Fixed bottom navigation */}
        <div className="shrink-0 border-t border-theme-border bg-bg/95 backdrop-blur-sm px-4 py-3">
          <div className="mx-auto max-w-3xl flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="rounded-lg bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-theme-border disabled:opacity-30"
            >
              ← 前へ
            </button>
            {currentIndex === questions.length - 1 ? (
              <div className="flex items-center gap-2">
                {allAnswered ? (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover disabled:opacity-50"
                  >
                    {completing ? '保存中...' : '学習を完了する'}
                  </button>
                ) : (
                  <>
                    <button
                      disabled
                      className="rounded-xl bg-primary/50 px-6 py-2.5 text-sm font-semibold text-white/70 cursor-not-allowed"
                    >
                      学習を完了する
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="text-text-secondary text-sm font-medium hover:text-text-primary"
                    >
                      ホームに戻る
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleNext}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                次へ →
              </button>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
