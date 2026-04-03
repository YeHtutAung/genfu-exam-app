export default function UploadPreviewPanel({ preview, onConfirm, onCancel, confirming }) {
  const { meta, questions, images } = preview

  const standardCount = questions.filter(q => q.type === 'standard').length
  const scenarioCount = questions.filter(q => q.type === 'scenario').length

  return (
    <div className="space-y-6">
      {/* Meta info */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-medium text-gray-900">テスト情報</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-gray-500">テストID</dt>
          <dd className="text-gray-900">{meta.test_id}</dd>
          <dt className="text-gray-500">カテゴリ</dt>
          <dd className="text-gray-900">{meta.category}</dd>
          <dt className="text-gray-500">テスト番号</dt>
          <dd className="text-gray-900">第{meta.test_number}回</dd>
          <dt className="text-gray-500">制限時間</dt>
          <dd className="text-gray-900">{meta.time_limit / 60}分</dd>
          <dt className="text-gray-500">合格点</dt>
          <dd className="text-gray-900">{meta.pass_score} / {meta.total_points}点</dd>
        </dl>
      </div>

      {/* Question summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-medium text-gray-900">問題サマリー</h3>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-gray-500">合計:</span>{' '}
            <span className="font-medium text-gray-900">{questions.length}問</span>
          </div>
          <div>
            <span className="text-gray-500">通常:</span>{' '}
            <span className="font-medium text-gray-900">{standardCount}問</span>
          </div>
          <div>
            <span className="text-gray-500">シナリオ:</span>{' '}
            <span className="font-medium text-gray-900">{scenarioCount}問</span>
          </div>
        </div>
      </div>

      {/* Images */}
      {images && images.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-medium text-gray-900">画像ファイル</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            {images.map((img, i) => (
              <li key={i}>{img}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Question list */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-medium text-gray-900">問題一覧</h3>
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-gray-500">
                <th className="pb-2 pr-3">No.</th>
                <th className="pb-2 pr-3">タイプ</th>
                <th className="pb-2">問題文（先頭40字）</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(q => (
                <tr key={q.id} className="border-b border-gray-50">
                  <td className="py-1.5 pr-3 text-gray-700">{q.question_number}</td>
                  <td className="py-1.5 pr-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      q.type === 'scenario'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {q.type === 'scenario' ? 'シナリオ' : '通常'}
                    </span>
                  </td>
                  <td className="py-1.5 text-gray-600">
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
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          onClick={onConfirm}
          disabled={confirming}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {confirming ? '登録中...' : 'テストを登録する'}
        </button>
      </div>
    </div>
  )
}
