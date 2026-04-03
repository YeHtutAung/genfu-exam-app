export default function UserList({ users }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-medium text-gray-500">
            <th className="pb-2 pr-4">メール</th>
            <th className="pb-2 pr-4">ロール</th>
            <th className="pb-2 pr-4">登録日</th>
            <th className="pb-2 pr-4 text-right">受験回数</th>
            <th className="pb-2 text-right">最高点</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b border-gray-100">
              <td className="py-3 pr-4 text-gray-900">{user.email}</td>
              <td className="py-3 pr-4">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="py-3 pr-4 text-gray-500">
                {new Date(user.created_at).toLocaleDateString('ja-JP')}
              </td>
              <td className="py-3 pr-4 text-right text-gray-700">{user.exam_count}</td>
              <td className="py-3 text-right text-gray-700">
                {user.best_score !== null ? user.best_score : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
