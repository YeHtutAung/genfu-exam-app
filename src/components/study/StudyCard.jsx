import { useState } from 'react'
import QuestionCard from '../exam/QuestionCard'
import AIExplanation from './AIExplanation'

export default function StudyCard({ question, onAnswer, userAnswer }) {
  const [revealed, setRevealed] = useState(false)
  const isScenario = question.type === 'scenario'

  const handleAnswer = (id, answer) => {
    onAnswer(id, answer)

    // For standard questions, reveal immediately after answer
    if (!isScenario) {
      setRevealed(true)
    }
  }

  const handleScenarioAnswer = (subId, answer) => {
    onAnswer(subId, answer)
  }

  // For scenario: reveal when all sub_questions answered
  const scenarioComplete = isScenario && question.sub_questions.every(
    sq => userAnswer?.[sq.id] !== undefined
  )

  const showResult = isScenario ? scenarioComplete : revealed

  return (
    <div>
      <QuestionCard
        question={question}
        onAnswer={isScenario ? handleScenarioAnswer : handleAnswer}
        showResult={showResult}
        userAnswer={isScenario ? userAnswer : userAnswer?.value}
      />

      {/* Hint — shown after answering */}
      {showResult && question.hint_jp && (
        <div className="mt-3 rounded-md bg-blue-50 p-4">
          <p className="mb-1 text-xs font-medium text-blue-600">ヒント</p>
          <p className="text-sm leading-relaxed text-gray-800">{question.hint_jp}</p>
        </div>
      )}

      {/* AI explanation — shown after answering */}
      {showResult && (
        <AIExplanation
          questionJp={question.question_jp}
          hintJp={question.hint_jp}
        />
      )}
    </div>
  )
}
