import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import confetti from 'canvas-confetti'
import CountUp from '../ui/CountUp'
import useReducedMotion from '../../hooks/useReducedMotion'
import Icon from '../ui/Icon'
import Button from '../ui/Button'
import { useI18n } from '../../lib/i18n'

export default function ScoreCard({ score, totalPoints, passScore, passed, timeTaken, testId, correctCount, wrongCount, unansweredCount, hideTimeTaken = false, hideCtas = false, mode = 'exam' }) {
  const { t } = useI18n()
  const reduced = useReducedMotion()
  // Format time taken
  const minutes = Math.floor(timeTaken / 60)
  const seconds = timeTaken % 60

  useEffect(() => {
    if (passed && mode !== 'study' && !reduced) {
      const timer = setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      }, 1600)
      return () => clearTimeout(timer)
    }
  }, [passed, mode, reduced])

  return (
    <div className="bg-bg border border-theme-border rounded-2xl p-6 shadow-sm text-center">
      {mode === 'study' ? (
        <>
          <Icon name="book" className="mx-auto mb-2 h-10 w-10 text-primary" />
          <h2 className="text-2xl font-bold text-primary">{t('study.completed')}</h2>
          <p className="text-sm text-text-secondary mt-1">{t('study.completedSubtitle')}</p>
        </>
      ) : passed ? (
        <>
          <Icon name="celebration" className="mx-auto mb-2 h-10 w-10 text-correct" />
          <h2 className="text-2xl font-bold text-correct">{t('score.passed')}</h2>
          <p className="text-sm text-text-secondary mt-1">{t('score.passedSubtitle')}</p>
        </>
      ) : (
        <>
          <Icon name="focus" className="mx-auto mb-2 h-10 w-10 text-wrong" />
          <h2 className="text-2xl font-bold text-wrong">{t('score.failed')}</h2>
          <p className="text-sm text-text-secondary mt-1">{t('score.failedSubtitle')}</p>
        </>
      )}

      {/* Score display */}
      <div className="my-6">
        <CountUp
          target={score}
          className={`text-5xl font-extrabold tracking-tight ${
            mode === 'study'
              ? 'text-primary'
              : passed
                ? 'text-correct'
                : 'text-wrong'
          }`}
        />
        <p className="text-sm text-text-secondary mt-1">/ {totalPoints}{t('common.points')}</p>
      </div>

      {/* Score bar */}
      <div className="w-48 mx-auto mt-3">
        <div className="h-1.5 rounded-full bg-theme-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              mode === 'study'
                ? 'bg-primary'
                : passed
                  ? 'bg-correct'
                  : 'bg-wrong'
            }`}
            style={{ width: `${(score / totalPoints) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-text-secondary">
          <span>0</span>
          <span>{mode === 'study' ? t('score.studyPassLine', { score: passScore }) : `${t('common.passLine')} ${passScore}`}</span>
          <span>{totalPoints}</span>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="rounded-xl bg-correct/10 p-3">
          <div className="text-lg font-bold text-correct">{correctCount ?? '—'}</div>
          <div className="text-xs text-text-secondary">{t('common.correct')}</div>
        </div>
        <div className="rounded-xl bg-wrong/10 p-3">
          <div className="text-lg font-bold text-wrong">{wrongCount ?? '—'}</div>
          <div className="text-xs text-text-secondary">{t('common.wrong')}</div>
        </div>
        <div className="bg-surface rounded-xl p-3">
          <div className="text-lg font-bold text-text-primary">{unansweredCount ?? '—'}</div>
          <div className="text-xs text-text-secondary">{t('common.unanswered')}</div>
        </div>
      </div>

      {/* Time taken */}
      {!hideTimeTaken && (
        <p className="mt-4 text-sm text-text-secondary">
          {t('exam.timeTaken')}: {minutes}{t('common.minutes')}{seconds > 0 ? `${seconds}${t('common.seconds')}` : ''}
        </p>
      )}

      {/* Fail CTA */}
      {!hideCtas && !passed && testId && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <Button
            as={Link}
            to={`/exam/${testId}`}
            className="px-6"
          >
            {t('exam.retake')}
          </Button>
          <Button
            as={Link}
            to={`/study/${testId}`}
            variant="ghost"
            size="sm"
          >
            {t('exam.learnWrong')}
          </Button>
        </div>
      )}
    </div>
  )
}
