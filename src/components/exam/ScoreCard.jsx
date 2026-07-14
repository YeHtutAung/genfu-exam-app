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
  const minutes = Math.floor(timeTaken / 60)
  const seconds = timeTaken % 60

  useEffect(() => {
    if (passed && mode !== 'study' && !reduced) {
      const timer = setTimeout(() => confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }), 1600)
      return () => clearTimeout(timer)
    }
  }, [passed, mode, reduced])

  const accent = mode === 'study' ? 'text-[#9FB0FF]' : passed ? 'text-[#72D69A]' : 'text-[#FF8C82]'
  const bar = mode === 'study' ? 'bg-primary' : passed ? 'bg-correct' : 'bg-wrong'

  return (
    <div className="rounded-[22px] bg-[#17150F] p-6 text-center text-white shadow-sm sm:p-8">
      {mode === 'study' ? (
        <><Icon name="book" className="mx-auto mb-2 h-10 w-10 text-[#9FB0FF]" /><h2 className="text-2xl font-extrabold text-[#9FB0FF]">{t('study.completed')}</h2><p className="mt-1 text-sm text-[#B7AF9A]">{t('study.completedSubtitle')}</p></>
      ) : (
        <><span className={`mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-full text-2xl font-bold ${passed ? 'bg-correct/20 text-[#72D69A]' : 'bg-wrong/20 text-[#FF8C82]'}`}>{passed ? '✓' : '×'}</span><h2 className={`text-2xl font-extrabold ${accent}`}>{passed ? t('score.passed') : t('score.failed')}</h2><p className="mt-1 text-sm text-[#B7AF9A]">{passed ? t('score.passedSubtitle') : t('score.failedSubtitle')}</p></>
      )}

      <div className="my-6"><CountUp target={score} className={`num text-[62px] font-extrabold leading-none tracking-tight ${accent}`} /><span className="num ml-2 text-sm text-[#B7AF9A]">/ {totalPoints}{t('common.points')}</span></div>
      <div className="mx-auto mt-3 w-56">
        <div className="h-1.5 overflow-hidden rounded-full bg-[#33302A]"><div className={`h-full rounded-full transition-all duration-1000 ${bar}`} style={{ width: `${(score / totalPoints) * 100}%` }} /></div>
        <div className="num mt-1 flex justify-between text-[10px] text-[#B7AF9A]"><span>0</span><span>{mode === 'study' ? t('score.studyPassLine', { score: passScore }) : `${t('common.passLine')} ${passScore}`}</span><span>{totalPoints}</span></div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat value={correctCount} label={t('common.correct')} className="bg-correct/15 text-[#72D69A]" />
        <Stat value={wrongCount} label={t('common.wrong')} className="bg-wrong/15 text-[#FF8C82]" />
        <Stat value={unansweredCount} label={t('common.unanswered')} className="bg-white/10 text-white" />
      </div>
      {!hideTimeTaken && <p className="mt-4 text-sm text-[#B7AF9A]">{t('exam.timeTaken')}: {minutes}{t('common.minutes')}{seconds > 0 ? `${seconds}${t('common.seconds')}` : ''}</p>}
      {!hideCtas && !passed && testId && <div className="mt-4 flex flex-col items-center gap-2"><Button as={Link} to={`/exam/${testId}`} className="px-6">{t('exam.retake')}</Button><Button as={Link} to={`/study/${testId}`} variant="ghost" size="sm" className="text-[#9FB0FF]">{t('exam.learnWrong')}</Button></div>}
    </div>
  )
}

function Stat({ value, label, className }) {
  return <div className={`rounded-xl p-3 ${className}`}><div className="num text-lg font-extrabold">{value ?? '—'}</div><div className="text-xs text-[#B7AF9A]">{label}</div></div>
}
