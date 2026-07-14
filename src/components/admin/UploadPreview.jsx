import { useI18n } from '../../lib/i18n'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function UploadPreviewPanel({ preview, onConfirm, onCancel, confirming }) {
  const { t, field } = useI18n()
  const { meta, questions, images } = preview

  const standardCount = questions.filter(q => q.type === 'standard').length
  const scenarioCount = questions.filter(q => q.type === 'scenario').length

  return (
    <div className="space-y-6">
      {/* Meta info */}
      <Card className="rounded-lg bg-surface p-5">
        <h3 className="mb-3 font-medium text-text-primary">{t('admin.testInfo')}</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-text-secondary">{t('admin.testId')}</dt>
          <dd className="text-text-primary">{meta.test_id}</dd>
          <dt className="text-text-secondary">{t('admin.category')}</dt>
          <dd className="text-text-primary">{meta.category}</dd>
          <dt className="text-text-secondary">{t('admin.testNumber')}</dt>
          <dd className="text-text-primary">{t('admin.testNumberValue', { number: meta.test_number })}</dd>
          <dt className="text-text-secondary">{t('admin.timeLimit')}</dt>
          <dd className="text-text-primary">{meta.time_limit / 60}{t('common.minutes')}</dd>
          <dt className="text-text-secondary">{t('admin.passingScore')}</dt>
          <dd className="text-text-primary">{meta.pass_score} / {meta.total_points}{t('common.points')}</dd>
        </dl>
      </Card>

      {/* Question summary */}
      <Card className="rounded-lg bg-surface p-5">
        <h3 className="mb-3 font-medium text-text-primary">{t('admin.questionSummary')}</h3>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-text-secondary">{t('admin.total')}:</span>{' '}
            <span className="font-medium text-text-primary">{questions.length}{t('common.questionShort')}</span>
          </div>
          <div>
            <span className="text-text-secondary">{t('admin.normal')}:</span>{' '}
            <span className="font-medium text-text-primary">{standardCount}{t('common.questionShort')}</span>
          </div>
          <div>
            <span className="text-text-secondary">{t('admin.scenario')}:</span>{' '}
            <span className="font-medium text-text-primary">{scenarioCount}{t('common.questionShort')}</span>
          </div>
        </div>
      </Card>

      {/* Images */}
      {images && images.length > 0 && (
        <Card className="rounded-lg bg-surface p-5">
          <h3 className="mb-3 font-medium text-text-primary">{t('admin.imageFiles')}</h3>
          <ul className="space-y-1 text-sm text-text-secondary">
            {images.map((img, i) => (
              <li key={i}>
                {typeof img === 'string' ? img : img.filename}
                {img.size ? ` (${(img.size / 1024).toFixed(1)} KB)` : ''}
                {img.matchedQuestionId ? ` → ${img.matchedQuestionId}` : ''}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Question list */}
      <Card className="rounded-lg bg-surface p-5">
        <h3 className="mb-3 font-medium text-text-primary">{t('admin.questionList')}</h3>
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-theme-border text-xs text-text-secondary">
                <th className="pb-2 pr-3">No.</th>
                <th className="pb-2 pr-3">{t('admin.type')}</th>
                <th className="pb-2">{t('admin.questionPreview')}</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(q => (
                <tr key={q.id} className="border-b border-theme-border/50">
                  <td className="py-1.5 pr-3 text-text-primary">{q.question_number}</td>
                  <td className="py-1.5 pr-3">
                    <Badge tone={q.type === 'scenario' ? 'primary' : 'default'}>
                      {q.type === 'scenario' ? t('admin.scenario') : t('admin.normal')}
                    </Badge>
                  </td>
                  <td className="py-1.5 text-text-secondary">
                    {field(q, 'question').slice(0, 40)}{field(q, 'question').length > 40 ? '...' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={onCancel}
          disabled={confirming}
          variant="outline"
          size="sm"
          className="rounded-md"
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={confirming}
          variant="success"
          size="sm"
          className="rounded-md"
        >
          {confirming ? t('admin.registering') : t('admin.registerTest')}
        </Button>
      </div>
    </div>
  )
}
