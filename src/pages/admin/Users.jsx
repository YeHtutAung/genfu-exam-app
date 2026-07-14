import { useState } from 'react'
import useAdmin from '../../hooks/useAdmin'
import UserList from '../../components/admin/UserList'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { AdminTableSkeleton } from '../../components/ui/LoadingPanels'
import { useI18n } from '../../lib/i18n'

export default function Users() {
  const { t } = useI18n()
  const { data: users, loading, error } = useAdmin('users')
  const [roleFilter, setRoleFilter] = useState('all')

  if (loading || !users) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
        <AdminTableSkeleton />
      </div>
    )
  }

  const filtered = roleFilter === 'all'
    ? users
    : users.filter(u => u.role === roleFilter)

  return (
    <div>
      <p className="signal-eyebrow">{t('signal.operations')}</p>
      <h1 className="mb-6 mt-1 text-[28px] font-extrabold tracking-tight text-text-primary">{t('admin.usersManagement')}</h1>

      {error && <p className="mb-4 text-sm text-wrong">{t(error)}</p>}

      <div className="mb-4 flex gap-2">
        {['all', 'user', 'admin'].map(r => (
          <Button
            key={r}
            onClick={() => setRoleFilter(r)}
            variant={roleFilter === r ? 'primary' : 'secondary'}
            size="sm"
            className="rounded-full"
          >
            {r === 'all' ? t('admin.allRoles') : r === 'admin' ? t('admin.adminRole') : t('admin.userRole')}
          </Button>
        ))}
        <span className="ml-2 self-center text-sm text-text-secondary">
          {t('admin.itemsCount', { count: filtered.length })}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-text-secondary">{t('admin.noUsers')}</p>
      ) : (
        <UserList users={filtered} />
      )}
    </div>
  )
}
