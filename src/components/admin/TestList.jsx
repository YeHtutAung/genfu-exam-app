import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Card from '../ui/Card'

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
          <h3 className="mb-2 text-sm font-medium text-text-secondary">{field(category, 'name')}</h3>
          {catTests.length === 0 ? (
            <p className="text-sm text-text-secondary">{t('admin.noTests')}</p>
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
    <Card className="flex flex-col gap-3 rounded-lg sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-medium text-text-primary">
            {field(test, 'title') || t('home.mockTest', { number: test.test_number })}
          </h4>
          <Badge tone={test.active ? 'correct' : 'default'}>
            {test.active ? t('admin.active') : t('admin.inactive')}
          </Badge>
        </div>
        <p className="mt-0.5 text-sm text-text-secondary">
          {t('admin.testStats', {
            questions: test.question_count ?? '?',
            points: test.total_points,
            passScore: test.pass_score,
          })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
        <Button
          as={Link}
          to={`/study/${test.id}`}
          variant="secondary"
          size="sm"
          className="rounded-md sm:min-h-0 sm:px-3 sm:py-1.5"
        >
          {t('admin.preview')}
        </Button>
        <Button
          onClick={() => onToggleActive(test.id, !test.active)}
          variant="ghost"
          size="sm"
          className={`rounded-md sm:min-h-0 sm:px-3 sm:py-1.5 ${
            test.active
              ? 'bg-warning/10 text-warning hover:bg-warning/20'
              : 'bg-correct/10 text-correct hover:bg-correct/20'
          }`}
        >
          {test.active ? t('admin.deactivate') : t('admin.activate')}
        </Button>
        <Button
          onClick={() => onDelete(test)}
          variant="ghost"
          size="sm"
          className="rounded-md bg-wrong/10 text-wrong hover:bg-wrong/20 sm:min-h-0 sm:px-3 sm:py-1.5"
        >
          {t('admin.delete')}
        </Button>
      </div>
    </Card>
  )
}
