import { useState } from 'react'
import useAdmin from '../../hooks/useAdmin'
import useAdminStore from '../../store/adminStore'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import useToast from '../../components/ui/useToast'
import { readinessPresentation } from '../../lib/readiness'

const filters = [
  { key: 'all', label: 'すべて' },
  { key: 'ready', label: '準備OK' },
  { key: 'almost', label: 'もう少し' },
  { key: 'needs', label: '要練習' },
]

export default function Analytics() {
  const { data: users, loading, error } = useAdmin('analytics')
  const sendGuidance = useAdminStore(s => s.sendGuidance)
  const { showToast } = useToast()
  const [filter, setFilter] = useState('all')
  const [sending, setSending] = useState(null)

  if (loading || !users) return <div className="flex justify-center py-20"><Spinner /></div>
  const visible = filter === 'all' ? users : users.filter(user => user.band === filter)
  const cohorts = ['ready', 'almost', 'needs'].map(band => ({ band, count: users.filter(user => user.band === band).length }))

  const handleSend = async user => {
    setSending(user.id)
    try {
      await sendGuidance(user.id, user.recommendedAction)
      showToast(`${user.email} にガイドを送信しました`, 'success')
    } catch (sendError) {
      showToast(sendError.message, 'error')
    } finally {
      setSending(null)
    }
  }

  return (
    <div>
      <p className="signal-eyebrow">運用</p>
      <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-text-primary">ユーザー分析</h1>
      <p className="mt-1 text-sm text-text-secondary">学習データから試験準備度と次のアクションを確認します。</p>
      {error && <p className="mt-4 text-sm text-wrong">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-2">{filters.map(item => <Button key={item.key} onClick={() => setFilter(item.key)} variant={filter === item.key ? 'primary' : 'outline'} size="sm" className="rounded-full">{item.label}</Button>)}</div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">{cohorts.map(({ band, count }) => <CohortCard key={band} band={band} count={count} />)}</div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-theme-border bg-surface">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-theme-border bg-[#FAF8F3] text-xs text-text-secondary"><tr><th className="px-4 py-3">ユーザー</th><th className="px-4 py-3">準備度</th><th className="px-4 py-3">最高点</th><th className="px-4 py-3">合格率</th><th className="px-4 py-3">おすすめアクション</th><th className="px-4 py-3" /></tr></thead>
            <tbody>{visible.map(user => <AnalyticsRow key={user.id} user={user} sending={sending} onSend={handleSend} />)}</tbody>
          </table>
        </div>
        <div className="space-y-3 p-3 lg:hidden">{visible.map(user => <AnalyticsCard key={user.id} user={user} sending={sending} onSend={handleSend} />)}</div>
      </div>
    </div>
  )
}

function CohortCard({ band, count }) {
  const info = readinessPresentation[band]
  const descriptions = { ready: '安定して合格ラインを超えているユーザー', almost: 'あと一歩で本番準備が整うユーザー', needs: '基礎の重点復習が必要なユーザー' }
  return <Card className="border-l-4" style={{ borderLeftColor: info.color }}><p className="text-sm font-bold text-text-primary">試験準備{info.label} <span className="num ml-1 text-2xl font-extrabold" style={{ color: info.color }}>{count}</span></p><p className="mt-1 text-xs text-text-secondary">{descriptions[band]}</p></Card>
}

function Readiness({ user }) {
  const info = readinessPresentation[user.band]
  return <div className="min-w-[120px]"><div className="flex items-center justify-between gap-2"><strong className="num text-lg" style={{ color: info.color }}>{user.readinessScore}</strong><span className="text-[11px] text-text-secondary">{info.label}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#EAE5D8]"><div className="h-full rounded-full" style={{ width: `${user.readinessScore}%`, backgroundColor: info.color }} /></div></div>
}

function AnalyticsRow({ user, sending, onSend }) {
  return <tr className="border-b border-theme-border last:border-0"><td className="px-4 py-4 font-semibold text-text-primary">{user.email}</td><td className="px-4 py-4"><Readiness user={user} /></td><td className="num px-4 py-4 font-bold text-text-primary">{user.bestScore ?? '—'}</td><td className="num px-4 py-4 text-text-primary">{user.passRate}%</td><td className="max-w-xs px-4 py-4 text-xs leading-relaxed text-text-secondary">{user.recommendedAction}</td><td className="px-4 py-4"><Button onClick={() => onSend(user)} disabled={sending === user.id} size="sm" className={user.band === 'ready' ? '' : 'bg-[#17150F] hover:bg-[#33302A]'}>{user.band === 'ready' ? '案内を送る' : 'ガイド送信'}</Button></td></tr>
}

function AnalyticsCard({ user, sending, onSend }) {
  return <Card><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-text-primary">{user.email}</p><Badge className="mt-1">最高 {user.bestScore ?? '—'}点 · 合格率 {user.passRate}%</Badge></div><Readiness user={user} /></div><p className="mt-3 text-xs leading-relaxed text-text-secondary">{user.recommendedAction}</p><Button onClick={() => onSend(user)} disabled={sending === user.id} size="sm" className={`mt-3 w-full ${user.band === 'ready' ? '' : 'bg-[#17150F] hover:bg-[#33302A]'}`}>{user.band === 'ready' ? '案内を送る' : 'ガイド送信'}</Button></Card>
}
