import { motion } from 'framer-motion'
import ImageRenderer from '../signs/ImageRenderer'
import BookmarkButton from '../ui/BookmarkButton'
import { useI18n } from '../../lib/i18n'

export default function QuestionCard({ question, onAnswer, showResult, userAnswer }) {
  const { t, field } = useI18n()
  const isScenario = question.type === 'scenario'
  const scenarioContext = field(question, 'scenario_context')

  return (
    <div className="bg-bg border border-theme-border rounded-xl p-4 shadow-sm sm:p-5">
      {/* Type label */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-primary">
        {isScenario ? t('exam.scenario') : t('exam.standard')} · {question.points}{t('common.points')}
        </p>
        <BookmarkButton questionId={question.id} />
      </div>

      {/* Question text */}
      <p className="text-base font-medium leading-relaxed text-text-primary font-jp mb-3 sm:text-lg">
        {field(question, 'question')}
      </p>

      {/* Image */}
      {question.image && (
        <div className="rounded-lg overflow-hidden my-3">
          <ImageRenderer image={question.image} />
        </div>
      )}

      {/* Scenario context */}
      {isScenario && scenarioContext && (
        <p className="mb-4 rounded bg-warning/10 p-3 text-sm text-text-primary">
          {scenarioContext}
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
  const { field } = useI18n()
  // userAnswer is an object: { sub_id: boolean }
  const answers = userAnswer || {}

  return (
    <div className="space-y-3">
      {subQuestions.map(sq => (
        <div key={sq.id} className="rounded border border-theme-border bg-surface p-3">
          <p className="mb-2 text-sm text-text-primary">
            <span className="font-medium text-text-secondary">({sq.sub_number})</span>{' '}
            {field(sq, 'text')}
          </p>
          <div className="flex flex-wrap gap-2">
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
        className={`flex min-h-11 min-w-14 items-center justify-center rounded-xl border-[1.5px] px-3 text-sm transition-all ${stateClasses} ${cursorClass}`}
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
      className={`min-h-12 flex-1 rounded-xl border-[1.5px] py-3 text-base font-medium transition-all ${stateClasses} ${cursorClass}`}
    >
      {label}
    </motion.button>
  )
}
