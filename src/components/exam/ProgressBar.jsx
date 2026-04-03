import useExamStore from '../../store/examStore'

export default function ProgressBar() {
  const questions = useExamStore(s => s.questions)
  const answers = useExamStore(s => s.answers)
  const currentIndex = useExamStore(s => s.currentIndex)

  // Count answered questions (standard: direct id, scenario: check all sub_questions answered)
  const answeredCount = questions.filter(q => {
    if (q.type === 'standard') {
      return answers[q.id] !== undefined
    }
    // Scenario: answered if at least one sub_question answered
    return q.sub_questions.some(sq => answers[sq.id] !== undefined)
  }).length

  const total = questions.length
  const pct = total > 0 ? (answeredCount / total) * 100 : 0

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-gray-500">
        <span>問 {currentIndex + 1} / {total}</span>
        <span>回答済み {answeredCount} / {total}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
