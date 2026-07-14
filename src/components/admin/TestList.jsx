import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function TestList({ tests, categories, onToggleActive, onDelete }) {
  const { t, field } = useI18n()
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'all')
  const visible = categoryId === 'all' ? tests : tests.filter(test => test.category_id === categoryId)
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map(category => <Button key={category.id} onClick={() => setCategoryId(category.id)} variant={categoryId === category.id ? 'primary' : 'outline'} size="sm" className="rounded-full">{field(category, 'name')}</Button>)}
      </div>
      <div className="hidden overflow-hidden rounded-2xl border border-theme-border bg-surface lg:block">
        <table className="w-full text-left text-sm"><thead className="border-b border-theme-border bg-[#FAF8F3] text-xs text-text-secondary"><tr><th className="px-5 py-3">{t('signal.tableTest')}</th><th className="px-5 py-3">{t('signal.tableStructure')}</th><th className="px-5 py-3">{t('signal.tableStatus')}</th><th className="px-5 py-3 text-right">{t('signal.tableActions')}</th></tr></thead><tbody>{visible.map(test => <TestRow key={test.id} test={test} onToggleActive={onToggleActive} onDelete={onDelete} />)}</tbody></table>
      </div>
      <div className="space-y-3 lg:hidden">{visible.map(test => <TestCard key={test.id} test={test} onToggleActive={onToggleActive} onDelete={onDelete} />)}</div>
    </div>
  )
}

function TestTitle({ test }) {
  const { t, field } = useI18n()
  return <><p className="font-bold text-text-primary">{field(test, 'title') || t('home.mockTest', { number: test.test_number })}</p><p className="mt-0.5 text-xs text-text-secondary">{t('signal.testStats', { questions: test.question_count ?? 48, points: test.total_points, passScore: test.pass_score })}</p></>
}

function Toggle({ active, onClick }) {
  const { t } = useI18n()
  const label = active ? t('signal.enabled') : t('signal.disabled')
  return <button type="button" role="switch" aria-checked={active} aria-label={label} onClick={onClick} className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-text-secondary"><span aria-hidden="true" className={`relative h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors ${active ? 'bg-correct' : 'bg-[#D9D2C4]'}`}><span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} /></span><span>{label}</span></button>
}

function Actions({ test, onToggleActive, onDelete }) {
  const { t } = useI18n()
  return <div className="flex flex-wrap justify-end gap-2"><Button as={Link} to={`/study/${test.id}`} variant="outline" size="sm">{t('signal.preview')}</Button><Button onClick={() => onToggleActive(test.id, !test.active)} variant={test.active ? 'secondary' : 'primary'} size="sm">{test.active ? t('signal.disable') : t('signal.enable')}</Button><Button onClick={() => onDelete(test)} variant="outline" size="sm" className="border-wrong/40 text-wrong hover:bg-wrong/5">{t('signal.delete')}</Button></div>
}

function TestRow({ test, onToggleActive, onDelete }) {
  const { t } = useI18n()
  return <tr className={`border-b border-theme-border last:border-0 ${test.active ? '' : 'opacity-70'}`}><td className="px-5 py-4"><TestTitle test={test} /></td><td className="px-5 py-4 text-text-secondary">{t('signal.testComposition', { questions: test.question_count ?? 48, points: test.total_points })}</td><td className="px-5 py-4"><Toggle active={test.active} onClick={() => onToggleActive(test.id, !test.active)} /></td><td className="px-5 py-4"><Actions test={test} onToggleActive={onToggleActive} onDelete={onDelete} /></td></tr>
}

function TestCard({ test, onToggleActive, onDelete }) {
  return <Card className={test.active ? '' : 'opacity-70'}><div className="flex items-start justify-between gap-3"><div><TestTitle test={test} /></div><Toggle active={test.active} onClick={() => onToggleActive(test.id, !test.active)} /></div><div className="mt-4"><Actions test={test} onToggleActive={onToggleActive} onDelete={onDelete} /></div></Card>
}
