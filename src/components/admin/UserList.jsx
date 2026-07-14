import { useI18n } from '../../lib/i18n'
import Badge from '../ui/Badge'
import Card from '../ui/Card'

export default function UserList({ users }) {
  const { language, t } = useI18n()
  const locale = language === 'ja' ? 'ja-JP' : language === 'my' ? 'my-MM' : 'en-US'
  return <><div className="hidden overflow-hidden rounded-2xl border border-theme-border bg-surface lg:block"><table className="w-full text-left text-sm"><thead className="border-b border-theme-border bg-[#FAF8F3] text-xs text-text-secondary"><tr><th className="px-5 py-3">{t('admin.email')}</th><th className="px-5 py-3">{t('admin.role')}</th><th className="px-5 py-3">{t('admin.createdAt')}</th><th className="px-5 py-3 text-right">{t('admin.examCount')}</th><th className="px-5 py-3 text-right">{t('admin.bestScore')}</th></tr></thead><tbody>{users.map(user => <UserRow key={user.id} user={user} locale={locale} />)}</tbody></table></div><div className="space-y-3 lg:hidden">{users.map(user => <UserCard key={user.id} user={user} locale={locale} />)}</div></>
}

function Avatar({ email }) { return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#17150F] text-[11px] font-extrabold text-white">{email?.slice(0, 2).toUpperCase()}</span> }
function Role({ role }) { return <Badge className={role === 'admin' ? 'bg-[#17150F] text-white' : 'bg-[#EAE5D8] text-text-secondary'}>{role === 'admin' ? '管理者' : '一般'}</Badge> }
function Score({ score }) { const tone = score >= 45 ? 'text-correct' : score >= 40 ? 'text-warning' : 'text-wrong'; return <strong className={`num ${score == null ? 'text-text-secondary' : tone}`}>{score ?? '—'}</strong> }
function UserRow({ user, locale }) { return <tr className="border-b border-theme-border last:border-0"><td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar email={user.email} /><span className="font-semibold text-text-primary">{user.email}</span></div></td><td className="px-5 py-4"><Role role={user.role} /></td><td className="num px-5 py-4 text-text-secondary">{new Date(user.created_at).toLocaleDateString(locale)}</td><td className="num px-5 py-4 text-right text-text-primary">{user.exam_count}</td><td className="px-5 py-4 text-right"><Score score={user.best_score} /></td></tr> }
function UserCard({ user, locale }) { return <Card><div className="flex items-center gap-3"><Avatar email={user.email} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-text-primary">{user.email}</p><p className="num text-xs text-text-secondary">{new Date(user.created_at).toLocaleDateString(locale)}</p></div><Role role={user.role} /></div><div className="mt-4 grid grid-cols-2 rounded-xl bg-[#FAF8F3] p-3 text-center text-xs text-text-secondary"><span>受験回数 <strong className="num block text-lg text-text-primary">{user.exam_count}</strong></span><span>最高点 <Score score={user.best_score} /></span></div></Card> }
