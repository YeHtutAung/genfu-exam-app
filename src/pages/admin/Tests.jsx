import { useState } from 'react'
import useAdmin from '../../hooks/useAdmin'
import useAdminStore from '../../store/adminStore'
import TestList from '../../components/admin/TestList'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { TestListSkeleton } from '../../components/ui/LoadingPanels'
import useToast from '../../components/ui/useToast'
import { useI18n } from '../../lib/i18n'

export default function Tests() {
  const { t, field } = useI18n()
  const { showToast } = useToast()
  const { data: tests, loading, error } = useAdmin('tests')
  const categories = useAdminStore(s => s.categories)
  const toggleTestActive = useAdminStore(s => s.toggleTestActive)
  const deleteTest = useAdminStore(s => s.deleteTest)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteTest(deleteTarget.id)
    showToast(t('admin.deleteConfirm'), 'success')
    setDeleteTarget(null)
  }

  const handleToggleActive = async (testId, active) => {
    await toggleTestActive(testId, active)
    showToast(active ? t('admin.activate') : t('admin.deactivate'), 'success')
  }

  if (loading || !tests) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
        <TestListSkeleton />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text-primary">{t('admin.testsManagement')}</h1>
      <Breadcrumbs items={[{ label: t('common.admin'), to: '/admin' }, { label: t('admin.testsManagement') }]} />

      {error && <p className="mb-4 text-sm text-wrong">{error}</p>}

      {tests.length === 0 ? (
        <p className="py-12 text-center text-text-secondary">{t('admin.noTestsLong')}</p>
      ) : (
        <TestList
          tests={tests}
          categories={categories}
          onToggleActive={handleToggleActive}
          onDelete={setDeleteTarget}
        />
      )}

      <Modal
        isOpen={!!deleteTarget}
        title={t('admin.deleteTest')}
        message={t('admin.deleteTestMessage', {
          title: field(deleteTarget, 'title') || t('home.mockTest', { number: deleteTarget?.test_number }),
        })}
        confirmLabel={t('admin.deleteConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  )
}
