import { Link } from 'react-router-dom'
import useAdmin from '../../hooks/useAdmin'
import Spinner from '../../components/ui/Spinner'

export default function AdminDashboard() {
  const { data: stats, loading, error } = useAdmin('stats')

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">管理ダッシュボード</h1>

      {error && <p className="mb-4 text-sm text-wrong">{error}</p>}

      {stats && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="ユーザー数" value={stats.users} />
            <StatCard label="テスト数" value={stats.tests} />
            <StatCard label="受験回数" value={stats.sessions} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <QuickLink to="/admin/tests" title="テスト管理" desc="テストの有効化・無効化・削除" />
            <QuickLink to="/admin/users" title="ユーザー管理" desc="ユーザー一覧と成績確認" />
            <QuickLink to="/admin/upload" title="テストアップロード" desc="ZIPバンドルで新規テスト追加" />
            <QuickLink to="/admin/images" title="問題画像" desc="既存の問題に画像をアップロード" />
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 text-center shadow-sm">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}

function QuickLink({ to, title, desc }) {
  return (
    <Link
      to={to}
      className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
    >
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </Link>
  )
}
