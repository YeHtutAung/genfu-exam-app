import useExamStore from '../../store/examStore'

export default function Timer() {
  const timeRemaining = useExamStore(s => s.timeRemaining)

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const isLow = timeRemaining <= 300 // 5 minutes
  const isCritical = timeRemaining <= 60

  return (
    <div
      className={`rounded-lg px-4 py-2 text-center font-mono text-lg font-bold ${
        isCritical
          ? 'animate-pulse bg-red-100 text-red-700'
          : isLow
            ? 'bg-amber-100 text-amber-700'
            : 'bg-gray-100 text-gray-700'
      }`}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
