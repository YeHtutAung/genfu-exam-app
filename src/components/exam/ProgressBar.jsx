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
      <div className="mb-1 flex justify-between">
        <span className="text-xs text-text-secondary font-medium">問 {currentIndex + 1} / {total}</span>
        <span className="text-xs text-text-secondary font-medium">回答済み {answeredCount} / {total}</span>
      </div>
      <div className="h-1.5 rounded-full bg-theme-border overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
