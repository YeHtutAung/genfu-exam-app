import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useExamStore from '../store/examStore'
import useTimer from '../hooks/useTimer'
import Timer from '../components/exam/Timer'
import ProgressBar from '../components/exam/ProgressBar'
import QuestionCard from '../components/exam/QuestionCard'
import Spinner from '../components/ui/Spinner'

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
        if (!isLast) nextQuestion()
      }, 300)
    }
  }

  // For scenario: auto-advance when all sub_questions answered
  const handleScenarioCheck = () => {
    if (!isLast) {
      nextQuestion()
    }
  }

  const allAnswered = questions.every(q => {
    if (q.type === 'standard') return answers[q.id] !== undefined
    return q.sub_questions.every(sq => answers[sq.id] !== undefined)
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header bar */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">
            {testMeta?.title_jp || '模擬試験'}
          </h1>
        </div>
        <Timer />
      </div>

      <div className="mb-4">
        <ProgressBar />
      </div>

      {/* Question */}
      <QuestionCard
        question={question}
        onAnswer={handleAnswer}
        showResult={false}
        userAnswer={isScenario ? userAnswer : userAnswer}
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

        {/* Question number grid */}
        <div className="hidden flex-wrap justify-center gap-1 sm:flex">
          {questions.map((q, i) => {
            const answered = q.type === 'standard'
              ? answers[q.id] !== undefined
              : q.sub_questions.some(sq => answers[sq.id] !== undefined)
            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(i)}
                className={`h-7 w-7 rounded text-xs font-medium ${
                  i === currentIndex
                    ? 'bg-blue-600 text-white'
                    : answered
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
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
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              allAnswered
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            {allAnswered ? '提出する' : '提出する（未回答あり）'}
          </button>
        ) : (
          <button
            onClick={isScenario ? handleScenarioCheck : nextQuestion}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            次の問題
          </button>
        )}
      </div>
    </div>
  )
}
