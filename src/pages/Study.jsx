import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useExamStore from '../store/examStore'
import StudyCard from '../components/study/StudyCard'
import Spinner from '../components/ui/Spinner'
import PageTransition from '../components/ui/PageTransition'
import Icon from '../components/ui/Icon'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { useI18n } from '../lib/i18n'

const slideVariants = {
  initial: (dir) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
}

export default function Study() {
  const { t } = useI18n()
  const { testId } = useParams()
  const navigate = useNavigate()

  const loading = useExamStore(s => s.loading)
  const error = useExamStore(s => s.error)
  const questions = useExamStore(s => s.questions)
  const currentIndex = useExamStore(s => s.currentIndex)
  const answers = useExamStore(s => s.answers)
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
        <div className="rounded-md bg-wrong/10 p-4 text-sm text-wrong">{error}</div>
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
      <div className="flex min-h-[calc(100dvh-4rem)] flex-col bg-bg">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
          <div className="mx-auto max-w-3xl">
            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h1 className="flex items-baseline">
                <span className="text-xs text-text-secondary">{t('study.mode')}</span>
                <span className="text-xl font-bold text-text-primary ml-1">{t('common.questionShort')} {current}</span>
                <span className="text-sm text-text-secondary ml-0.5">/ {total}</span>
              </h1>
              <Badge tone="primary" className="px-2.5 py-1 font-semibold">
                <Icon name="book" className="h-3.5 w-3.5" />
                {t('study.studying')}
              </Badge>
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
        <div className="shrink-0 border-t border-theme-border bg-bg/95 px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-4">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-between">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              variant="secondary"
              className="rounded-lg disabled:opacity-30 sm:px-4"
            >
              {t('study.previous')}
            </Button>
            {currentIndex === questions.length - 1 ? (
              <div className="contents sm:flex sm:items-center sm:gap-2">
                {allAnswered ? (
                  <Button
                    onClick={handleComplete}
                    disabled={completing}
                    className="sm:px-6"
                  >
                    {completing ? t('common.saving') : t('study.complete')}
                  </Button>
                ) : (
                  <>
                    <Button
                      disabled
                      className="bg-primary/50 text-white/70 cursor-not-allowed sm:px-6"
                    >
                      {t('study.complete')}
                    </Button>
                    <Button
                      onClick={() => navigate('/')}
                      variant="secondary"
                      className="rounded-lg hover:text-text-primary"
                    >
                      {t('common.backHome')}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <Button
                onClick={handleNext}
                className="rounded-lg sm:px-4"
              >
                {t('study.next')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
