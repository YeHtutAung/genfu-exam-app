import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadQuestionImage } from '../../lib/api'
import Spinner from '../../components/ui/Spinner'
import PageTransition from '../../components/ui/PageTransition'
import useToast from '../../components/ui/useToast'
import { useI18n } from '../../lib/i18n'

export default function QuestionImages() {
  const [tests, setTests] = useState([])
  const [selectedTest, setSelectedTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(null)
  const [message, setMessage] = useState(null)
  const [imageVersion, setImageVersion] = useState(Date.now())
  const { showToast } = useToast()
  const { t, field } = useI18n()

  useEffect(() => {
    supabase.from('tests').select('id, test_number, title_jp, title_en, title_my, category_id, categories(code, name_jp, name_en, name_my)').order('test_number').then(({ data }) => { setTests(data || []); setLoading(false) })
  }, [])

  const loadQuestions = async testId => {
    if (!testId) { setQuestions([]); return }
    const { data } = await supabase.from('questions').select('id, question_number, question_jp, question_en, question_my, image_render, image_url, sign_code, image_alt').eq('test_id', testId).order('question_number')
    setQuestions(data || [])
  }

  useEffect(() => { loadQuestions(selectedTest) }, [selectedTest])

  const handleUpload = async (questionId, file) => {
    setUploading(questionId); setMessage(null)
    try {
      await uploadQuestionImage({ questionId, file, imageAlt: file.name })
      await loadQuestions(selectedTest)
      setImageVersion(Date.now())
      setMessage({ type: 'success', text: t('signal.imageUploaded', { number: questions.find(question => question.id === questionId)?.question_number }) })
      showToast(t('signal.imageUploadedToast'), 'success')
    } catch (error) {
      setMessage({ type: 'error', text: error.message }); showToast(error.message, 'error')
    } finally { setUploading(null) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>

  return <PageTransition><div>
    <p className="signal-eyebrow">{t('signal.operations')}</p><h1 className="mb-6 mt-1 text-[28px] font-extrabold tracking-tight text-text-primary">{t('admin.questionImages')}</h1>
    <select value={selectedTest || ''} onChange={event => setSelectedTest(event.target.value || null)} className="mb-6 h-[50px] w-full max-w-md rounded-xl border-[1.5px] border-theme-border bg-surface px-3 text-text-primary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10">
      <option value="">{t('signal.selectTest')}</option>{tests.map(test => <option key={test.id} value={test.id}>{t('signal.testOption', { category: field(test.categories, 'name'), number: test.test_number })}{field(test, 'title') ? ` (${field(test, 'title')})` : ''}</option>)}
    </select>
    {message && <div className={`mb-4 rounded-xl p-3 text-sm ${message.type === 'success' ? 'bg-[#E7F6ED] text-correct' : 'bg-[#FDECEA] text-wrong'}`}>{message.text}</div>}
    {selectedTest && questions.length > 0 && <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{questions.map(question => <ImageCard key={question.id} question={question} uploading={uploading} imageVersion={imageVersion} onUpload={handleUpload} />)}</div>}
    {selectedTest && questions.length === 0 && <p className="py-8 text-center text-text-secondary">{t('signal.noQuestions')}</p>}
  </div></PageTransition>
}

function ImageCard({ question, uploading, imageVersion, onUpload }) {
  const { t, field } = useI18n()
  const filename = question.image_url?.split('/').pop()?.split('?')[0]
  return <article className="flex flex-col rounded-2xl border border-theme-border bg-surface p-4 shadow-sm">
    <div className={`flex h-[150px] items-center justify-center overflow-hidden rounded-xl ${question.image_url ? 'bg-[#EEF1FE]' : 'border border-dashed border-[#C6BEAC] bg-[#FDF3E3]'}`}>
      {question.image_url ? <img src={`${question.image_url}?v=${imageVersion}`} alt={question.image_alt || ''} className="h-full w-full object-contain" /> : <span className="text-sm font-bold text-warning">{t('signal.noImage')}</span>}
    </div>
    <div className="mt-3 flex-1"><p className="font-bold text-text-primary">{t('signal.questionNumber', { number: question.question_number })} {field(question, 'question')?.slice(0, 18)}</p><p className={`mt-1 text-xs ${filename ? 'text-correct' : 'text-warning'}`}>{filename || (question.image_render === 'css' ? `CSS: ${question.sign_code}` : t('signal.noImage'))}</p></div>
    <label className={`mt-4 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl px-3 text-sm font-bold transition-colors ${uploading === question.id ? 'bg-primary/20 text-primary' : question.image_url ? 'border-[1.5px] border-[#D9D2C4] bg-white text-text-primary hover:border-primary' : 'bg-primary text-white hover:bg-primary-hover'}`}>
      {uploading === question.id ? '...' : question.image_url ? t('signal.replace') : t('signal.upload')}
      <input type="file" accept="image/png" className="hidden" disabled={uploading === question.id} onChange={event => { const file = event.target.files?.[0]; if (file) onUpload(question.id, file); event.target.value = '' }} />
    </label>
  </article>
}
