import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/ui/Spinner'
import PageTransition from '../../components/ui/PageTransition'

export default function QuestionImages() {
  const [tests, setTests] = useState([])
  const [selectedTest, setSelectedTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(null) // questionId being uploaded
  const [message, setMessage] = useState(null)

  // Load tests
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('tests')
        .select('id, test_number, title_jp, category_id, categories(code, name_jp)')
        .order('test_number')
      setTests(data || [])
      setLoading(false)
    }
    load()
  }, [])

  // Load questions when test selected
  useEffect(() => {
    if (!selectedTest) {
      setQuestions([])
      return
    }
    async function load() {
      const { data } = await supabase
        .from('questions')
        .select('id, question_number, question_jp, image_render, image_url, sign_code, image_alt')
        .eq('test_id', selectedTest)
        .order('question_number')
      setQuestions(data || [])
    }
    load()
  }, [selectedTest])

  const handleUpload = async (questionId, file) => {
    setUploading(questionId)
    setMessage(null)

    const formData = new FormData()
    formData.append('questionId', questionId)
    formData.append('image', file)
    formData.append('imageAlt', file.name)

    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `問${questions.find(q => q.id === questionId)?.question_number}: 画像をアップロードしました` })
        // Refresh questions
        const { data: updated } = await supabase
          .from('questions')
          .select('id, question_number, question_jp, image_render, image_url, sign_code, image_alt')
          .eq('test_id', selectedTest)
          .order('question_number')
        setQuestions(updated || [])
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setUploading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">問題画像の管理</h1>

        {/* Test selector */}
        <select
          value={selectedTest || ''}
          onChange={e => setSelectedTest(e.target.value || null)}
          className="mb-6 w-full rounded-lg border border-theme-border bg-surface px-3 py-2 text-text-primary"
        >
          <option value="">テストを選択...</option>
          {tests.map(t => (
            <option key={t.id} value={t.id}>
              {t.categories?.name_jp} - テスト {t.test_number} {t.title_jp ? `(${t.title_jp})` : ''}
            </option>
          ))}
        </select>

        {/* Message */}
        {message && (
          <div className={`mb-4 rounded-lg p-3 text-sm ${
            message.type === 'success'
              ? 'bg-correct/10 text-correct'
              : 'bg-wrong/10 text-wrong'
          }`}>
            {message.text}
          </div>
        )}

        {/* Questions list */}
        {selectedTest && questions.length > 0 && (
          <div className="space-y-3">
            {questions.map(q => (
              <div key={q.id} className="flex items-start gap-4 rounded-xl border border-theme-border bg-surface p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-text-primary">問{q.question_number}</span>
                    {q.image_render === 'css' && (
                      <span className="rounded bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 text-xs text-blue-700 dark:text-blue-300">CSS: {q.sign_code}</span>
                    )}
                    {q.image_render === 'static' && (
                      <span className="rounded bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 text-xs text-green-700 dark:text-green-300">画像あり</span>
                    )}
                    {!q.image_render && (
                      <span className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs text-text-secondary">画像なし</span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary font-jp line-clamp-2">{q.question_jp}</p>

                  {/* Show current image */}
                  {q.image_render === 'static' && q.image_url && (
                    <img src={q.image_url} alt={q.image_alt} className="mt-2 h-20 rounded border border-theme-border object-contain" />
                  )}
                </div>

                {/* Upload button */}
                <div className="shrink-0">
                  <label className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    uploading === q.id
                      ? 'bg-primary/20 text-primary'
                      : 'bg-primary text-white hover:bg-primary-hover'
                  }`}>
                    {uploading === q.id ? '...' : q.image_url ? '変更' : 'アップロード'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      disabled={uploading === q.id}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleUpload(q.id, file)
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTest && questions.length === 0 && (
          <p className="text-center text-text-secondary py-8">問題が見つかりません</p>
        )}
      </div>
    </PageTransition>
  )
}
