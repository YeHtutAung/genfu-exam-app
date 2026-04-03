import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import TestList from '../../components/admin/TestList'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

export default function Tests() {
  const [tests, setTests] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchData = async () => {
    const [catRes, testRes] = await Promise.all([
      supabase.from('categories').select('*').order('code'),
      supabase.from('tests').select('*, questions(id)').order('test_number'),
    ])

    setCategories(catRes.data || [])

    // Attach question count
    const testsWithCount = (testRes.data || []).map(t => ({
      ...t,
      question_count: t.questions?.length ?? 0,
    }))
    setTests(testsWithCount)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleToggleActive = async (testId, active) => {
    await supabase.from('tests').update({ active }).eq('id', testId)
    setTests(prev => prev.map(t => t.id === testId ? { ...t, active } : t))
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await supabase.from('tests').delete().eq('id', deleteTarget.id)
    setTests(prev => prev.filter(t => t.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">テスト管理</h1>

      {tests.length === 0 ? (
        <p className="py-12 text-center text-gray-500">テストがありません</p>
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
