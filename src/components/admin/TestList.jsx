import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function TestList({ tests, categories, onToggleActive, onDelete }) {
  const { field } = useI18n()
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'all')
  const visible = categoryId === 'all' ? tests : tests.filter(test => test.category_id === categoryId)
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map(category => <Button key={category.id} onClick={() => setCategoryId(category.id)} variant={categoryId === category.id ? 'primary' : 'outline'} size="sm" className="rounded-full">{field(category, 'name')}</Button>)}
      </div>
      <div className="hidden overflow-hidden rounded-2xl border border-theme-border bg-surface lg:block">
        <table className="w-full text-left text-sm"><thead className="border-b border-theme-border bg-[#FAF8F3] text-xs text-text-secondary"><tr><th className="px-5 py-3">テスト</th><th className="px-5 py-3">構成</th><th className="px-5 py-3">状態</th><th className="px-5 py-3 text-right">操作</th></tr></thead><tbody>{visible.map(test => <TestRow key={test.id} test={test} onToggleActive={onToggleActive} onDelete={onDelete} />)}</tbody></table>
      </div>
      <div className="space-y-3 lg:hidden">{visible.map(test => <TestCard key={test.id} test={test} onToggleActive={onToggleActive} onDelete={onDelete} />)}</div>
    </div>
  )
}

function TestTitle({ test }) {
  const { t, field } = useI18n()
  return <><p className="font-bold text-text-primary">{field(test, 'title') || t('home.mockTest', { number: test.test_number })}</p><p className="mt-0.5 text-xs text-text-secondary">{test.question_count ?? 48}問 / {test.total_points}点 / 合格{test.pass_score}</p></>
}

function Toggle({ active, onClick }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary"><span className={`relative h-6 w-11 rounded-full transition-colors ${active ? 'bg-correct' : 'bg-[#D9D2C4]'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} /></span>{active ? '有効' : '無効'}</button>
}

function Actions({ test, onToggleActive, onDelete }) {
  return <div className="flex flex-wrap justify-end gap-2"><Button as={Link} to={`/study/${test.id}`} variant="outline" size="sm">プレビュー</Button><Button onClick={() => onToggleActive(test.id, !test.active)} variant={test.active ? 'secondary' : 'primary'} size="sm">{test.active ? '無効化' : '有効化'}</Button><Button onClick={() => onDelete(test)} variant="outline" size="sm" className="border-wrong/40 text-wrong hover:bg-wrong/5">削除</Button></div>
}

function TestRow({ test, onToggleActive, onDelete }) {
  return <tr className={`border-b border-theme-border last:border-0 ${test.active ? '' : 'opacity-70'}`}><td className="px-5 py-4"><TestTitle test={test} /></td><td className="px-5 py-4 text-text-secondary">{test.question_count ?? 48}問 / {test.total_points}点</td><td className="px-5 py-4"><Toggle active={test.active} onClick={() => onToggleActive(test.id, !test.active)} /></td><td className="px-5 py-4"><Actions test={test} onToggleActive={onToggleActive} onDelete={onDelete} /></td></tr>
}

function TestCard({ test, onToggleActive, onDelete }) {
  return <Card className={test.active ? '' : 'opacity-70'}><div className="flex items-start justify-between gap-3"><div><TestTitle test={test} /></div><Toggle active={test.active} onClick={() => onToggleActive(test.id, !test.active)} /></div><div className="mt-4"><Actions test={test} onToggleActive={onToggleActive} onDelete={onDelete} /></div></Card>
}
