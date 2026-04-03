import { useState } from 'react'
import { explain } from '../../lib/api'
import Spinner from '../ui/Spinner'

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

  if (!requested) {
    return (
      <button
        onClick={handleRequest}
        className="mt-3 rounded-md bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100"
      >
        AIに解説を聞く
      </button>
    )
  }

  if (loading) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-md bg-purple-50 p-4">
        <Spinner size="h-5 w-5" />
        <span className="text-sm text-purple-700">解説を生成中…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
        解説の取得に失敗しました: {error}
      </div>
    )
  }

  return (
    <div className="mt-3 rounded-md bg-purple-50 p-4">
      <p className="mb-1 text-xs font-medium text-purple-600">AI解説</p>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
        {explanation}
      </p>
    </div>
  )
}
