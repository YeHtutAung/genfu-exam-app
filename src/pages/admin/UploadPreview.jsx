import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { confirmUpload } from '../../lib/api'
import useAdminStore from '../../store/adminStore'
import UploadPreviewPanel from '../../components/admin/UploadPreview'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/ui/Button'
import useToast from '../../components/ui/useToast'
import { useI18n } from '../../lib/i18n'

export default function UploadPreview() {
  const { t } = useI18n()
  const { showToast } = useToast()
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
        <p className="text-text-secondary">{t('admin.noPreviewData')}</p>
        <Button
          onClick={() => navigate('/admin/upload')}
          className="mt-4 rounded-md"
        >
          {t('admin.backToUpload')}
        </Button>
      </div>
    )
  }

  const handleConfirm = async () => {
    if (!categoryId) {
      setError(t('admin.categoryNotFound', { category: preview.meta.category }))
      return
    }
    setConfirming(true)
    setError(null)
    try {
      await confirmUpload({ ...preview, categoryId })
      clearUploadPreview()
      showToast(t('admin.registerTest'), 'success')
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
      <h1 className="mb-6 text-2xl font-bold text-text-primary">{t('admin.uploadPreview')}</h1>
      <Breadcrumbs items={[{ label: t('common.admin'), to: '/admin' }, { label: t('admin.testUpload'), to: '/admin/upload' }, { label: t('admin.uploadPreview') }]} />

      <UploadPreviewPanel
        preview={preview}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirming={confirming}
      />

      {error && (
        <div className="mt-4 rounded-md bg-wrong/10 p-4 text-sm text-wrong">
          {error}
        </div>
      )}
    </div>
  )
}
