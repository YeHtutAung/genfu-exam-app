import { useState } from 'react'
import useAdmin from '../../hooks/useAdmin'
import UserList from '../../components/admin/UserList'
import Spinner from '../../components/ui/Spinner'
import { useI18n } from '../../lib/i18n'

export default function Users() {
  const { t } = useI18n()
  const { data: users, loading, error } = useAdmin('users')
  const [roleFilter, setRoleFilter] = useState('all')

  if (loading || !users) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  const filtered = roleFilter === 'all'
    ? users
    : users.filter(u => u.role === roleFilter)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t('admin.usersManagement')}</h1>

      {error && <p className="mb-4 text-sm text-wrong">{error}</p>}

      <div className="mb-4 flex gap-2">
        {['all', 'user', 'admin'].map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              roleFilter === r
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {r === 'all' ? t('admin.allRoles') : r === 'admin' ? t('admin.adminRole') : t('admin.userRole')}
          </button>
        ))}
        <span className="ml-2 self-center text-sm text-gray-400">
          {t('admin.itemsCount', { count: filtered.length })}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-gray-500">{t('admin.noUsers')}</p>
      ) : (
        <UserList users={filtered} />
      )}
    </div>
  )
}
