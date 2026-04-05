import { useState } from 'react'
import useAdmin from '../../hooks/useAdmin'
import useAdminStore from '../../store/adminStore'
import TestList from '../../components/admin/TestList'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

export default function Tests() {
  const { data: tests, loading, error } = useAdmin('tests')
  const categories = useAdminStore(s => s.categories)
  const toggleTestActive = useAdminStore(s => s.toggleTestActive)
  const deleteTest = useAdminStore(s => s.deleteTest)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteTest(deleteTarget.id)
    setDeleteTarget(null)
  }

  if (loading || !tests) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">テスト管理</h1>

      {error && <p className="mb-4 text-sm text-wrong">{error}</p>}

      {tests.length === 0 ? (
        <p className="py-12 text-center text-gray-500">テストがありません</p>
      ) : (
        <TestList
          tests={tests}
          categories={categories}
          onToggleActive={toggleTestActive}
          onDelete={setDeleteTarget}
        />
      )}

      <Modal
        isOpen={!!deleteTarget}
        title="テストを削除"
        message={`「${deleteTarget?.title_jp || `テスト第${deleteTarget?.test_number}回`}」を削除しますか？この操作は取り消せません。`}
        confirmLabel="削除する"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  )
}
