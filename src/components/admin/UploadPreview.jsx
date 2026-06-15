import { useI18n } from '../../lib/i18n'

export default function UploadPreviewPanel({ preview, onConfirm, onCancel, confirming }) {
  const { t } = useI18n()
  const { meta, questions, images } = preview

  const standardCount = questions.filter(q => q.type === 'standard').length
  const scenarioCount = questions.filter(q => q.type === 'scenario').length

  return (
    <div className="space-y-6">
      {/* Meta info */}
      <div className="rounded-lg border border-theme-border bg-surface p-5 shadow-sm">
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
      </div>

      {/* Question summary */}
      <div className="rounded-lg border border-theme-border bg-surface p-5 shadow-sm">
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
      </div>

      {/* Images */}
      {images && images.length > 0 && (
        <div className="rounded-lg border border-theme-border bg-surface p-5 shadow-sm">
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
        </div>
      )}

      {/* Question list */}
      <div className="rounded-lg border border-theme-border bg-surface p-5 shadow-sm">
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
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      q.type === 'scenario'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {q.type === 'scenario' ? t('admin.scenario') : t('admin.normal')}
                    </span>
                  </td>
                  <td className="py-1.5 text-text-secondary">
                    {q.question_jp.slice(0, 40)}{q.question_jp.length > 40 ? '...' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={confirming}
          className="rounded-md bg-surface px-4 py-2 text-sm font-medium text-text-secondary border border-theme-border hover:bg-theme-border disabled:opacity-50"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={onConfirm}
          disabled={confirming}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {confirming ? t('admin.registering') : t('admin.registerTest')}
        </button>
      </div>
    </div>
  )
}
