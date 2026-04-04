import { motion } from 'framer-motion'
import ImageRenderer from '../signs/ImageRenderer'

export default function QuestionCard({ question, onAnswer, showResult, userAnswer }) {
  const isScenario = question.type === 'scenario'

  return (
    <div className="bg-bg border border-theme-border rounded-xl p-5 shadow-sm">
      {/* Type label */}
      <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
        {isScenario ? `シナリオ問題 · ${question.points}点` : `標準問題 · ${question.points}点`}
      </p>

      {/* Question text */}
      <p className="text-lg font-medium leading-relaxed text-text-primary font-jp mb-3">
        {question.question_jp}
      </p>

      {/* Image */}
      {question.image && (
        <div className="rounded-lg overflow-hidden my-3">
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
    <div className="flex gap-3 mt-4">
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
        <div key={sq.id} className="rounded border border-theme-border bg-surface p-3">
          <p className="mb-2 text-sm text-text-primary">
            <span className="font-medium text-text-secondary">({sq.sub_number})</span>{' '}
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
  let stateClasses = ''

  if (correct) {
    stateClasses = 'border-correct bg-correct/5 text-correct font-semibold'
  } else if (wrong) {
    stateClasses = 'border-wrong bg-wrong/5 text-wrong font-semibold'
  } else if (selected) {
    stateClasses = 'border-primary bg-primary/5 text-primary ring-2 ring-primary/10 font-semibold'
  } else {
    stateClasses = 'border-theme-border bg-bg text-text-secondary hover:bg-surface'
  }

  const cursorClass = disabled ? 'cursor-default' : 'cursor-pointer'

  if (small) {
    return (
      <motion.button
        whileTap={disabled ? {} : { scale: 0.97 }}
        onClick={onClick}
        disabled={disabled}
        className={`flex h-8 w-12 items-center justify-center rounded-xl border-[1.5px] text-sm transition-all ${stateClasses} ${cursorClass}`}
      >
        {label}
      </motion.button>
    )
  }

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 rounded-xl border-[1.5px] py-3 text-base font-medium transition-all ${stateClasses} ${cursorClass}`}
    >
      {label}
    </motion.button>
  )
}
