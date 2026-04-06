import { useState } from 'react'
import { motion } from 'framer-motion'
import ImageRenderer from '../signs/ImageRenderer'
import AIExplanation from './AIExplanation'
import useReducedMotion from '../../hooks/useReducedMotion'

export default function StudyCard({ question, onAnswer, userAnswer }) {
  const [revealed, setRevealed] = useState(false)
  const reduced = useReducedMotion()
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
      {showResult && question.hint_jp && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
          style={{ overflow: 'hidden' }}
        >
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 mt-3">
            <p className="mb-1 text-xs">
              <span className="font-medium text-amber-800 dark:text-amber-300">💡 ヒント:</span>
            </p>
            <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
              {question.hint_jp}
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
            questionJp={question.question_jp}
            hintJp={question.hint_jp}
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
  return (
    <div className="space-y-3">
      {subQuestions.map(sq => (
        <div key={sq.id} className="rounded border border-theme-border bg-surface p-3">
          <p className="mb-2 text-sm text-text-primary">
            <span className="font-medium text-text-secondary">({sq.sub_number})</span>{' '}
            {sq.text_jp}
          </p>
          <div className="flex gap-2">
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
      stateClasses = 'border-correct bg-correct/5 text-correct font-semibold'
      animateProps = reduced ? {} : { scale: [1, 1.05, 1] }
    } else if (isUserWrong) {
      stateClasses = 'border-wrong bg-wrong/5 text-wrong font-semibold'
      animateProps = reduced ? {} : { x: [-8, 8, -8, 8, 0] }
      label_suffix = <span className="text-xs ml-1">← あなたの回答</span>
    } else if (isCorrectNotSelected) {
      stateClasses = 'border-correct bg-correct/5 text-correct font-semibold'
      label_suffix = <span className="text-xs ml-1">✓</span>
    } else {
      stateClasses = 'border-theme-border bg-bg text-text-secondary'
    }
  } else if (isUserAnswer) {
    stateClasses = 'border-primary bg-primary/5 text-primary ring-2 ring-primary/10 font-semibold'
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
          className={`flex h-8 w-12 items-center justify-center rounded-xl border-[1.5px] text-sm transition-all ${stateClasses} ${cursorClass}`}
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
        className={`w-full rounded-xl border-[1.5px] py-3 text-base font-medium transition-all ${stateClasses} ${cursorClass}`}
      >
        {label}
        {label_suffix}
      </motion.button>
    </motion.div>
  )
}
