import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { confirmUpload } from '../../lib/api'
import UploadPreviewPanel from '../../components/admin/UploadPreview'

export default function UploadPreview() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState(null)

  // If no preview data (e.g. direct navigation), redirect back
  if (!state?.preview) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <p className="text-gray-500">プレビューデータがありません。</p>
        <button
          onClick={() => navigate('/admin/upload')}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          アップロードに戻る
        </button>
      </div>
    )
  }

  const handleConfirm = async () => {
    setConfirming(true)
    setError(null)
    try {
      await confirmUpload(state.preview)
      navigate('/admin/tests')
    } catch (err) {
      setError(err.message)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">アップロードプレビュー</h1>

      <UploadPreviewPanel
        preview={state.preview}
        onConfirm={handleConfirm}
        onCancel={() => navigate('/admin/upload')}
        confirming={confirming}
      />

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
