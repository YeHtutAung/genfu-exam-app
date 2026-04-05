import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadBundle } from '../../lib/api'
import useAdminStore from '../../store/adminStore'
import UploadForm from '../../components/admin/UploadForm'

export default function Upload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const setUploadPreview = useAdminStore(s => s.setUploadPreview)

  const handleUpload = async (formData) => {
    setUploading(true)
    setError(null)
    try {
      const preview = await uploadBundle(formData)
      setUploadPreview(preview)
      navigate('/admin/upload/preview')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">テストアップロード</h1>
      <p className="mb-6 text-sm text-gray-500">
        ZIPバンドル（JSON + 画像）をアップロードして新しいテストを追加します。
      </p>

      <UploadForm onUpload={handleUpload} uploading={uploading} />

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
