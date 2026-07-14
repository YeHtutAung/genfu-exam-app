import { useState } from 'react'
import { motion } from 'framer-motion'
import ImageRenderer from '../signs/ImageRenderer'
import AIExplanation from './AIExplanation'
import BookmarkButton from '../ui/BookmarkButton'
import Icon from '../ui/Icon'
import useReducedMotion from '../../hooks/useReducedMotion'
import { useI18n } from '../../lib/i18n'

export default function StudyCard({ question, onAnswer, userAnswer }) {
  const { t, field } = useI18n()
  const [revealed, setRevealed] = useState(false)
  const reduced = useReducedMotion()
  const isScenario = question.type === 'scenario'
  const scenarioContext = field(question, 'scenario_context')
  const hint = field(question, 'hint')

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
    <div className="rounded-2xl border border-theme-border bg-surface p-5 shadow-[0_1px_2px_rgba(23,21,15,0.04)] sm:p-6">
      {/* Type label */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="signal-eyebrow pt-2">
        {isScenario ? t('exam.scenario') : t('exam.standard')} · {question.points}{t('common.points')}
        </p>
        <BookmarkButton questionId={question.id} />
      </div>

      {/* Question text */}
      <p className="mb-3 font-jp text-[17px] font-medium leading-[1.65] text-text-primary sm:text-lg">
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
          onAnswer={handleScenarioAnswer}
          showResult={showResult}
          userAnswer={userAnswer || {}}
          reduced={reduced}
        />
      ) : (
        <StandardAnswers
          questionId={question.id}
          onAnswer={handleAnswer}
          showResult={showResult}
          userAnswer={userAnswer?.value}
          correctAnswer={question.answer}
          reduced={reduced}
        />
      )}

      {/* Hint card — shown after answering */}
      {showResult && hint && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
          style={{ overflow: 'hidden' }}
        >
          <div className="mt-3 rounded-xl border border-[#F4E0BC] bg-[#FDF3E3] p-3">
            <p className="mb-1 text-xs">
              <span className="inline-flex items-center gap-1 font-medium text-warning">
                <Icon name="lightbulb" className="h-4 w-4" />
                {t('study.hint')}
              </span>
            </p>
            <p className="text-sm text-text-primary leading-relaxed">
              {hint}
            </p>
          </div>
        </motion.div>
      )}

      {/* AI explanation — shown after answering */}
      {showResult && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
          style={{ overflow: 'hidden' }}
        >
          <AIExplanation
            questionJp={field(question, 'question')}
            hintJp={hint}
          />
        </motion.div>
      )}
    </div>
  )
}

function StandardAnswers({ questionId, onAnswer, showResult, userAnswer, correctAnswer, reduced }) {
  return (
    <div className="flex gap-3 mt-4">
      <StudyAnswerButton
        label="○"
        value={true}
        userAnswer={userAnswer}
        correctAnswer={correctAnswer}
        showResult={showResult}
        onClick={() => onAnswer(questionId, true)}
        reduced={reduced}
      />
      <StudyAnswerButton
        label="×"
        value={false}
        userAnswer={userAnswer}
        correctAnswer={correctAnswer}
        showResult={showResult}
        onClick={() => onAnswer(questionId, false)}
        reduced={reduced}
      />
    </div>
  )
}

function ScenarioAnswers({ subQuestions, onAnswer, showResult, userAnswer, reduced }) {
  const { field } = useI18n()

  return (
    <div className="space-y-3">
      {subQuestions.map(sq => (
        <div key={sq.id} className="rounded border border-theme-border bg-surface p-3">
          <p className="mb-2 text-sm text-text-primary">
            <span className="font-medium text-text-secondary">({sq.sub_number})</span>{' '}
            {field(sq, 'text')}
          </p>
          <div className="flex flex-wrap gap-2">
            <StudyAnswerButton
              label="○"
              value={true}
              userAnswer={userAnswer[sq.id]}
              correctAnswer={sq.answer}
              showResult={showResult}
              onClick={() => onAnswer(sq.id, true)}
              reduced={reduced}
              small
            />
            <StudyAnswerButton
              label="×"
              value={false}
              userAnswer={userAnswer[sq.id]}
              correctAnswer={sq.answer}
              showResult={showResult}
              onClick={() => onAnswer(sq.id, false)}
              reduced={reduced}
              small
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function StudyAnswerButton({ label, value, userAnswer, correctAnswer, showResult, onClick, reduced, small }) {
  const { t } = useI18n()
  const isUserAnswer = userAnswer === value
  const isCorrect = correctAnswer === value
  const isUserCorrect = isUserAnswer && isCorrect
  const isUserWrong = isUserAnswer && !isCorrect
  // The correct answer that the user did NOT select
  const isCorrectNotSelected = isCorrect && !isUserAnswer

  let stateClasses = ''
  let animateProps = {}
  let label_suffix = null

  if (showResult) {
    if (isUserCorrect) {
      stateClasses = 'border-correct bg-[#E7F6ED] text-correct font-semibold'
      animateProps = reduced ? {} : { scale: [1, 1.05, 1] }
      label_suffix = <span className="ml-2 text-xs">✓ {t('common.correct')}</span>
    } else if (isUserWrong) {
      stateClasses = 'border-wrong bg-[#FDECEA] text-wrong font-semibold'
      animateProps = reduced ? {} : { x: [-8, 8, -8, 8, 0] }
      label_suffix = <span className="text-xs ml-1">{t('study.yourAnswer')}</span>
    } else if (isCorrectNotSelected) {
      stateClasses = 'border-correct bg-[#E7F6ED] text-correct font-semibold'
      label_suffix = <span className="text-xs ml-1">✓</span>
    } else {
      stateClasses = 'border-theme-border bg-bg text-text-secondary'
    }
  } else if (isUserAnswer) {
    stateClasses = 'border-primary bg-[#EEF1FE] text-primary ring-4 ring-primary/10 font-semibold'
  } else {
    stateClasses = 'border-theme-border bg-bg text-text-secondary hover:bg-surface'
  }

  const transitionProps = (isUserCorrect && !reduced)
    ? { duration: 0.4 }
    : (isUserWrong && !reduced)
    ? { duration: 0.3 }
    : {}

  const cursorClass = showResult ? 'cursor-default' : 'cursor-pointer'

  if (small) {
    return (
      <motion.div animate={animateProps} transition={transitionProps}>
        <motion.button
          whileTap={showResult ? {} : { scale: 0.97 }}
          onClick={onClick}
          disabled={showResult}
          className={`flex min-h-11 min-w-14 items-center justify-center rounded-xl border-[1.5px] px-3 text-sm transition-all ${stateClasses} ${cursorClass}`}
        >
          {label}
          {label_suffix}
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div animate={animateProps} transition={transitionProps} className="flex-1">
      <motion.button
        whileTap={showResult ? {} : { scale: 0.97 }}
        onClick={onClick}
        disabled={showResult}
        className={`h-[76px] w-full rounded-xl border-[1.5px] py-2 text-[34px] font-bold leading-none transition-all ${stateClasses} ${cursorClass}`}
      >
        {label}
        {label_suffix}
      </motion.button>
    </motion.div>
  )
}
