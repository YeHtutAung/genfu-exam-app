import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { confirmUpload } from '../../lib/api'
import useAdminStore from '../../store/adminStore'
import UploadPreviewPanel from '../../components/admin/UploadPreview'

export default function UploadPreview() {
  const navigate = useNavigate()
  const preview = useAdminStore(s => s.uploadPreview)
  const clearUploadPreview = useAdminStore(s => s.clearUploadPreview)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState(null)
  const [categoryId, setCategoryId] = useState(null)

  // Resolve category code → UUID
  useEffect(() => {
    if (!preview?.meta?.category) return
    supabase
      .from('categories')
      .select('id')
      .eq('code', preview.meta.category)
      .single()
      .then(({ data, error: catErr }) => {
        if (catErr) console.error('Category lookup failed:', catErr)
        if (data) setCategoryId(data.id)
      })
  }, [preview?.meta?.category])

  // If no preview data (e.g. direct navigation), redirect back
  if (!preview) {
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
    if (!categoryId) {
      setError(`カテゴリ "${preview.meta.category}" が見つかりません`)
      return
    }
    setConfirming(true)
    setError(null)
    try {
      await confirmUpload({ ...preview, categoryId })
      clearUploadPreview()
      navigate('/admin/tests')
    } catch (err) {
      setError(err.message)
    } finally {
      setConfirming(false)
    }
  }

  const handleCancel = () => {
    clearUploadPreview()
    navigate('/admin/upload')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">アップロードプレビュー</h1>

      <UploadPreviewPanel
        preview={preview}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
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
