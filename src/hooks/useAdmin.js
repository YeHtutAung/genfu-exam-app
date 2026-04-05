import { useEffect } from 'react'
import useAdminStore from '../store/adminStore'

const sectionMap = {
  stats: {
    data:    s => s.stats,
    loading: s => s.statsLoading,
    error:   s => s.statsError,
    fetch:   'fetchStats',
  },
  tests: {
    data:    s => s.tests,
    loading: s => s.testsLoading,
    error:   s => s.testsError,
    fetch:   'fetchTests',
  },
  users: {
    data:    s => s.users,
    loading: s => s.usersLoading,
    error:   s => s.usersError,
    fetch:   'fetchUsers',
  },
}

export default function useAdmin(section) {
  const map = sectionMap[section]
  const data    = useAdminStore(map.data)
  const loading = useAdminStore(map.loading)
  const error   = useAdminStore(map.error)
  const action  = useAdminStore(s => s[map.fetch])

  useEffect(() => { action() }, [])

  return { data, loading, error, refetch: action }
}
