import ImageRenderer from '../signs/ImageRenderer'

export default function QuestionCard({ question, onAnswer, showResult, userAnswer }) {
  const isScenario = question.type === 'scenario'

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Question header */}
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {question.question_number}
        </span>
        <div className="flex-1">
          {isScenario && (
            <span className="mb-1 inline-block rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              危険予測問題（{question.points}点）
            </span>
          )}
          {!isScenario && (
            <span className="mb-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {question.points}点
            </span>
          )}
          <p className="text-base leading-relaxed text-gray-900">{question.question_jp}</p>
        </div>
      </div>

      {/* Image */}
      {question.image && (
        <div className="mb-4">
          <ImageRenderer image={question.image} />
        </div>
      )}

      {/* Scenario context */}
      {isScenario && question.scenario_context_jp && (
        <p className="mb-4 rounded bg-amber-50 p-3 text-sm text-amber-800">
          {question.scenario_context_jp}
        </p>
      )}

      {/* Answer area */}
      {isScenario ? (
        <ScenarioAnswers
          subQuestions={question.sub_questions}
          onAnswer={onAnswer}
          showResult={showResult}
          userAnswer={userAnswer}
        />
      ) : (
        <StandardAnswers
          questionId={question.id}
          onAnswer={onAnswer}
          showResult={showResult}
          userAnswer={userAnswer}
          correctAnswer={question.answer}
        />
      )}
    </div>
  )
}

function StandardAnswers({ questionId, onAnswer, showResult, userAnswer, correctAnswer }) {
  return (
    <div className="flex gap-3">
      <AnswerButton
        label="○"
        value={true}
        selected={userAnswer === true}
        correct={showResult && correctAnswer === true}
        wrong={showResult && userAnswer === true && correctAnswer !== true}
        onClick={() => onAnswer(questionId, true)}
        disabled={showResult}
      />
      <AnswerButton
        label="×"
        value={false}
        selected={userAnswer === false}
        correct={showResult && correctAnswer === false}
        wrong={showResult && userAnswer === false && correctAnswer !== false}
        onClick={() => onAnswer(questionId, false)}
        disabled={showResult}
      />
    </div>
  )
}

function ScenarioAnswers({ subQuestions, onAnswer, showResult, userAnswer }) {
  // userAnswer is an object: { sub_id: boolean }
  const answers = userAnswer || {}

  return (
    <div className="space-y-3">
      {subQuestions.map(sq => (
        <div key={sq.id} className="rounded border border-gray-100 bg-gray-50 p-3">
          <p className="mb-2 text-sm text-gray-800">
            <span className="font-medium text-gray-500">({sq.sub_number})</span>{' '}
            {sq.text_jp}
          </p>
          <div className="flex gap-2">
            <AnswerButton
              label="○"
              value={true}
              selected={answers[sq.id] === true}
              correct={showResult && sq.answer === true}
              wrong={showResult && answers[sq.id] === true && sq.answer !== true}
              onClick={() => onAnswer(sq.id, true)}
              disabled={showResult}
              small
            />
            <AnswerButton
              label="×"
              value={false}
              selected={answers[sq.id] === false}
              correct={showResult && sq.answer === false}
              wrong={showResult && answers[sq.id] === false && sq.answer !== false}
              onClick={() => onAnswer(sq.id, false)}
              disabled={showResult}
              small
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function AnswerButton({ label, selected, correct, wrong, onClick, disabled, small }) {
  let className = small
    ? 'flex h-8 w-12 items-center justify-center rounded text-sm font-bold transition-colors'
    : 'flex h-12 w-20 items-center justify-center rounded-lg text-lg font-bold transition-colors'

  if (correct) {
    className += ' bg-green-100 text-green-700 ring-2 ring-green-500'
  } else if (wrong) {
    className += ' bg-red-100 text-red-700 ring-2 ring-red-500'
  } else if (selected) {
    className += ' bg-blue-600 text-white'
  } else {
    className += ' bg-gray-100 text-gray-700 hover:bg-gray-200'
  }

  if (disabled) {
    className += ' cursor-default'
  } else {
    className += ' cursor-pointer'
  }

  return (
    <button onClick={onClick} disabled={disabled} className={className}>
      {label}
    </button>
  )
}
