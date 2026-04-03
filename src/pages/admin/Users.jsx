import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import UserList from '../../components/admin/UserList'
import Spinner from '../../components/ui/Spinner'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    async function fetchUsers() {
      // Get all profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!profiles) {
        setLoading(false)
        return
      }

      // Get exam stats per user
      const { data: sessions } = await supabase
        .from('exam_sessions')
        .select('user_id, score')
        .eq('mode', 'exam')
        .not('score', 'is', null)

      // Aggregate stats
      const statsMap = {}
      for (const s of sessions || []) {
        if (!statsMap[s.user_id]) {
          statsMap[s.user_id] = { count: 0, best: null }
        }
        statsMap[s.user_id].count++
        if (statsMap[s.user_id].best === null || s.score > statsMap[s.user_id].best) {
          statsMap[s.user_id].best = s.score
        }
      }

      const enriched = profiles.map(p => ({
        ...p,
        exam_count: statsMap[p.id]?.count ?? 0,
        best_score: statsMap[p.id]?.best ?? null,
      }))

      setUsers(enriched)
      setLoading(false)
    }
    fetchUsers()
  }, [])

  const filtered = roleFilter === 'all'
    ? users
    : users.filter(u => u.role === roleFilter)

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">ユーザー管理</h1>

      {/* Role filter */}
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
            {r === 'all' ? 'すべて' : r === 'admin' ? '管理者' : '一般'}
          </button>
        ))}
        <span className="ml-2 self-center text-sm text-gray-400">
          {filtered.length}件
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-gray-500">ユーザーがいません</p>
      ) : (
        <UserList users={filtered} />
      )}
    </div>
  )
}
