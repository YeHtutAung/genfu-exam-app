import { useI18n } from '../../lib/i18n'
import Badge from '../ui/Badge'

export default function UserList({ users }) {
  const { language, t } = useI18n()
  const locale = language === 'ja' ? 'ja-JP' : language === 'my' ? 'my-MM' : 'en-US'

  return (
    <div className="overflow-x-auto rounded-lg border border-theme-border">
      <table className="min-w-[640px] w-full text-left text-sm">
        <thead>
          <tr className="border-b border-theme-border text-xs font-medium text-text-secondary">
            <th className="pb-2 pr-4">{t('admin.email')}</th>
            <th className="pb-2 pr-4">{t('admin.role')}</th>
            <th className="pb-2 pr-4">{t('admin.createdAt')}</th>
            <th className="pb-2 pr-4 text-right">{t('admin.examCount')}</th>
            <th className="pb-2 text-right">{t('admin.bestScore')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b border-theme-border/60">
              <td className="py-3 pr-4 text-text-primary">{user.email}</td>
              <td className="py-3 pr-4">
                <Badge tone={user.role === 'admin' ? 'ai' : 'default'}>
                  {user.role}
                </Badge>
              </td>
              <td className="py-3 pr-4 text-text-secondary">
                {new Date(user.created_at).toLocaleDateString(locale)}
              </td>
              <td className="py-3 pr-4 text-right text-text-primary">{user.exam_count}</td>
              <td className="py-3 text-right text-text-primary">
                {user.best_score !== null ? user.best_score : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
