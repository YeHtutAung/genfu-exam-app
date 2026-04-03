export default function ScoreCard({ score, totalPoints, passScore, passed, timeTaken }) {
  const pct = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0

  // Format time taken
  const minutes = Math.floor(timeTaken / 60)
  const seconds = timeTaken % 60

  return (
    <div className={`rounded-lg border-2 p-6 text-center ${
      passed ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
    }`}>
      <div className={`text-4xl font-bold ${passed ? 'text-green-700' : 'text-red-700'}`}>
        {passed ? '合格' : '不合格'}
      </div>

      <div className="mt-4 text-5xl font-bold text-gray-900">
        {score}<span className="text-2xl text-gray-500">/{totalPoints}</span>
      </div>

      <p className="mt-1 text-sm text-gray-500">
        {pct}% — 合格ライン {passScore}点
      </p>

      <p className="mt-2 text-sm text-gray-500">
        所要時間: {minutes}分{seconds > 0 ? `${seconds}秒` : ''}
      </p>
    </div>
  )
}
