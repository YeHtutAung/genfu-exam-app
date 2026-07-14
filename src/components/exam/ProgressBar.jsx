import useExamStore from '../../store/examStore'
import { useI18n } from '../../lib/i18n'

export default function ProgressBar() {
  const { t } = useI18n()
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
        <span className="text-xs text-text-secondary font-medium">{t('common.questionShort')} {currentIndex + 1} / {total}</span>
        <span className="text-xs text-text-secondary font-medium">{t('common.answer')} {answeredCount} / {total}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[3px] bg-[#EAE5D8]">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
