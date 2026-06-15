import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'

export default function TestList({ tests, categories, onToggleActive, onDelete }) {
  const { t, field } = useI18n()
  // Group tests by category
  const grouped = {}
  for (const cat of categories) {
    grouped[cat.id] = { category: cat, tests: [] }
  }
  for (const test of tests) {
    if (grouped[test.category_id]) {
      grouped[test.category_id].tests.push(test)
    }
  }

  return (
    <div className="space-y-6">
      {Object.values(grouped).map(({ category, tests: catTests }) => (
        <div key={category.id}>
          <h3 className="mb-2 text-sm font-medium text-gray-500">{field(category, 'name')}</h3>
          {catTests.length === 0 ? (
            <p className="text-sm text-gray-400">{t('admin.noTests')}</p>
          ) : (
            <div className="space-y-2">
              {catTests.map(test => (
                <TestRow
                  key={test.id}
                  test={test}
                  onToggleActive={onToggleActive}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function TestRow({ test, onToggleActive, onDelete }) {
  const { t, field } = useI18n()

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">
            {field(test, 'title') || t('home.mockTest', { number: test.test_number })}
          </h4>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            test.active
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {test.active ? t('admin.active') : t('admin.inactive')}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-gray-500">
          {t('admin.testStats', {
            questions: test.question_count ?? '?',
            points: test.total_points,
            passScore: test.pass_score,
          })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={`/study/${test.id}`}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
        >
          {t('admin.preview')}
        </Link>
        <button
          onClick={() => onToggleActive(test.id, !test.active)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${
            test.active
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {test.active ? t('admin.deactivate') : t('admin.activate')}
        </button>
        <button
          onClick={() => onDelete(test)}
          className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
        >
          {t('admin.delete')}
        </button>
      </div>
    </div>
  )
}
