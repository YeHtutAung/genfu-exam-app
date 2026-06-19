import { useI18n } from '../../lib/i18n'

export default function UserList({ users }) {
  const { language, t } = useI18n()
  const locale = language === 'ja' ? 'ja-JP' : language === 'my' ? 'my-MM' : 'en-US'

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-[640px] w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-medium text-gray-500">
            <th className="pb-2 pr-4">{t('admin.email')}</th>
            <th className="pb-2 pr-4">{t('admin.role')}</th>
            <th className="pb-2 pr-4">{t('admin.createdAt')}</th>
            <th className="pb-2 pr-4 text-right">{t('admin.examCount')}</th>
            <th className="pb-2 text-right">{t('admin.bestScore')}</th>
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
                {new Date(user.created_at).toLocaleDateString(locale)}
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
