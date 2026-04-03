import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useExamStore from '../store/examStore'
import StudyCard from '../components/study/StudyCard'
import ProgressBar from '../components/exam/ProgressBar'
import Spinner from '../components/ui/Spinner'

export default function Study() {
  const { testId } = useParams()

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

  // Key to force StudyCard remount when question changes
  const [cardKey, setCardKey] = useState(0)

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
  const isScenario = question.type === 'scenario'

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-900">
          {testMeta?.title_jp || '学習モード'}
          <span className="ml-2 text-sm font-normal text-gray-500">学習</span>
        </h1>
      </div>

      <div className="mb-4">
        <ProgressBar />
      </div>

      <StudyCard
        key={cardKey}
        question={question}
        onAnswer={handleAnswer}
        userAnswer={userAnswer}
      />

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-40"
        >
          前の問題
        </button>

        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {questions.length}
        </span>

        <button
          onClick={nextQuestion}
          disabled={currentIndex === questions.length - 1}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
        >
          次の問題
        </button>
      </div>
    </div>
  )
}
