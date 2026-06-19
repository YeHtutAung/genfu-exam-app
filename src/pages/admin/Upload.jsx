import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadBundle } from '../../lib/api'
import useAdminStore from '../../store/adminStore'
import UploadForm from '../../components/admin/UploadForm'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import useToast from '../../components/ui/useToast'
import { useI18n } from '../../lib/i18n'

export default function Upload() {
  const { t } = useI18n()
  const { showToast } = useToast()
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
      showToast(t('admin.uploadPreview'), 'success')
      navigate('/admin/upload/preview')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text-primary">{t('admin.testUpload')}</h1>
      <Breadcrumbs items={[{ label: t('common.admin'), to: '/admin' }, { label: t('admin.testUpload') }]} />
      <p className="mb-6 text-sm text-text-secondary">
        {t('admin.uploadDescription')}
      </p>

      <UploadForm onUpload={handleUpload} uploading={uploading} />

      {error && (
        <div className="mt-4 rounded-md bg-wrong/10 p-4 text-sm text-wrong">
          {error}
        </div>
      )}
    </div>
  )
}
