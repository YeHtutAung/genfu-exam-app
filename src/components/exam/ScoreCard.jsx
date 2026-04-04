import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import confetti from 'canvas-confetti'
import CountUp from '../ui/CountUp'

export default function ScoreCard({ score, totalPoints, passScore, passed, timeTaken, testId, correctCount, wrongCount, unansweredCount }) {
  // Format time taken
  const minutes = Math.floor(timeTaken / 60)
  const seconds = timeTaken % 60

  useEffect(() => {
    if (passed) {
      const timer = setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      }, 1600)
      return () => clearTimeout(timer)
    }
  }, [passed])

  return (
    <div className="bg-bg border border-theme-border rounded-2xl p-6 shadow-sm text-center">
      {passed ? (
        <>
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">合格！</h2>
          <p className="text-sm text-text-secondary mt-1">おめでとうございます</p>
        </>
      ) : (
        <>
          <div className="text-4xl mb-2">😤</div>
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">不合格</h2>
          <p className="text-sm text-text-secondary mt-1">もう一度挑戦しましょう！</p>
        </>
      )}

      {/* Score display */}
      <div className="my-6">
        <CountUp
          target={score}
          className={`text-5xl font-extrabold tracking-tight ${
            passed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
          }`}
        />
        <p className="text-sm text-text-secondary mt-1">/ {totalPoints}点</p>
      </div>

      {/* Score bar */}
      <div className="w-48 mx-auto mt-3">
        <div className="h-1.5 rounded-full bg-theme-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              passed
                ? 'bg-gradient-to-r from-green-500 to-green-400'
                : 'bg-gradient-to-r from-red-500 to-red-400'
            }`}
            style={{ width: `${(score / totalPoints) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-text-secondary">
          <span>0</span>
          <span>合格ライン {passScore}</span>
          <span>{totalPoints}</span>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
          <div className="text-lg font-bold text-green-700 dark:text-green-400">{correctCount ?? '—'}</div>
          <div className="text-xs text-text-secondary">正解</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
          <div className="text-lg font-bold text-red-700 dark:text-red-400">{wrongCount ?? '—'}</div>
          <div className="text-xs text-text-secondary">不正解</div>
        </div>
        <div className="bg-surface rounded-xl p-3">
          <div className="text-lg font-bold text-text-primary">{unansweredCount ?? '—'}</div>
          <div className="text-xs text-text-secondary">未回答</div>
        </div>
      </div>

      {/* Time taken */}
      <p className="mt-4 text-sm text-text-secondary">
        所要時間: {minutes}分{seconds > 0 ? `${seconds}秒` : ''}
      </p>

      {/* Fail CTA */}
      {!passed && testId && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <Link
            to={`/exam/${testId}`}
            className="bg-primary text-white rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover inline-block"
          >
            もう一度受験
          </Link>
          <Link
            to={`/study/${testId}`}
            className="text-primary text-sm font-medium hover:text-primary-hover block"
          >
            間違えた問題を学習モードで復習
          </Link>
        </div>
      )}
    </div>
  )
}
