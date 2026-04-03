import useAuthStore from '../store/authStore'

export default function Home() {
  const user = useAuthStore(s => s.user)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-gray-900">原付免許 模擬試験</h1>
      <p className="mt-2 text-gray-500">
        ようこそ{user?.email ? `、${user.email}` : ''} さん
      </p>
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-gray-600">試験カテゴリーは近日公開予定です</p>
      </div>
    </div>
  )
}
