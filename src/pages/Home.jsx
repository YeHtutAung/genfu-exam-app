import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'
import Spinner from '../components/ui/Spinner'

export default function Home() {
  const user = useAuthStore(s => s.user)
  const [categories, setCategories] = useState([])
  const [tests, setTests] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch active categories on mount
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('code')

      if (error) {
        setError(error.message)
      } else {
        setCategories(data)
        if (data.length > 0) setSelectedCategory(data[0].id)
      }
      setLoading(false)
    }
    fetchCategories()
  }, [])

  // Fetch tests when category changes
  useEffect(() => {
    if (!selectedCategory) return

    async function fetchTests() {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('category_id', selectedCategory)
        .eq('active', true)
        .order('test_number')

      if (error) {
        setError(error.message)
      } else {
        setTests(data)
      }
    }
    fetchTests()
  }, [selectedCategory])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">原付免許 模擬試験</h1>
        <p className="mt-2 text-gray-500">
          ようこそ{user?.email ? `、${user.email}` : ''} さん
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Category selector */}
      {categories.length > 0 ? (
        <>
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name_jp}
              </button>
            ))}
          </div>

          {/* Test list */}
          {tests.length > 0 ? (
            <div className="space-y-3">
              {tests.map(test => (
                <div
                  key={test.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {test.title_jp || `模擬テスト 第${test.test_number}回`}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {test.total_points}点満点 / 合格{test.pass_score}点以上 / 制限時間{test.time_limit / 60}分
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/exam/${test.id}`}
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      試験
                    </Link>
                    <Link
                      to={`/study/${test.id}`}
                      className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                      学習
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">このカテゴリーにはまだテストがありません</p>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">試験カテゴリーは近日公開予定です</p>
        </div>
      )}
    </div>
  )
}
