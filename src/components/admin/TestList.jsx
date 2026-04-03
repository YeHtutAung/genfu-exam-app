import { Link } from 'react-router-dom'

export default function TestList({ tests, categories, onToggleActive, onDelete }) {
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
          <h3 className="mb-2 text-sm font-medium text-gray-500">{category.name_jp}</h3>
          {catTests.length === 0 ? (
            <p className="text-sm text-gray-400">テストなし</p>
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
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">
            {test.title_jp || `模擬テスト 第${test.test_number}回`}
          </h4>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            test.active
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {test.active ? '有効' : '無効'}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-gray-500">
          {test.question_count ?? '?'}問 / {test.total_points}点満点 / 合格{test.pass_score}点
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={`/study/${test.id}`}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
        >
          プレビュー
        </Link>
        <button
          onClick={() => onToggleActive(test.id, !test.active)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${
            test.active
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {test.active ? '無効にする' : '有効にする'}
        </button>
        <button
          onClick={() => onDelete(test)}
          className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
        >
          削除
        </button>
      </div>
    </div>
  )
}
