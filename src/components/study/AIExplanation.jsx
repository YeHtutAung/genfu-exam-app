import { useState } from 'react'
import { explain } from '../../lib/api'
import Skeleton from '../ui/Skeleton'

export default function AIExplanation({ questionJp, hintJp }) {
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [requested, setRequested] = useState(false)

  const handleRequest = async () => {
    setLoading(true)
    setError(null)
    setRequested(true)

    try {
      const res = await explain(questionJp, hintJp)
      const text = await res.text()
      setExplanation(text)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4 shadow-sm mt-3">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-ai to-purple-600 text-white text-xs">
          ✨
        </div>
        <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">AI解説</span>
      </div>

      {/* Not yet requested */}
      {!requested && (
        <button
          onClick={handleRequest}
          className="rounded-lg bg-ai/10 px-3 py-1.5 text-sm font-medium text-ai transition-colors hover:bg-ai/20"
        >
          AIに解説を聞く
        </button>
      )}

      {/* Loading skeleton */}
      {requested && loading && (
        <div className="space-y-2 mt-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      )}

      {/* Error */}
      {requested && !loading && error && (
        <p className="text-sm text-red-600 mt-2">
          解説の取得に失敗しました: {error}
        </p>
      )}

      {/* Explanation text */}
      {requested && !loading && !error && explanation && (
        <p className="text-sm text-purple-900 dark:text-purple-200 leading-relaxed whitespace-pre-wrap mt-2">
          {explanation}
        </p>
      )}
    </div>
  )
}
