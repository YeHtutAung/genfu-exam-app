import { Link } from 'react-router-dom'
import PageTransition from '../components/ui/PageTransition'
import { useI18n } from '../lib/i18n'

const readinessChecks = [
  {
    titleKey: 'tips.check1Title',
    detailKey: 'tips.check1Detail',
  },
  {
    titleKey: 'tips.check2Title',
    detailKey: 'tips.check2Detail',
  },
  {
    titleKey: 'tips.check3Title',
    detailKey: 'tips.check3Detail',
  },
  {
    titleKey: 'tips.check4Title',
    detailKey: 'tips.check4Detail',
  },
]

const tips = [
  {
    labelKey: 'tips.wording',
    itemKeys: ['tips.wording1', 'tips.wording2', 'tips.wording3'],
  },
  {
    labelKey: 'tips.signs',
    itemKeys: ['tips.signs1', 'tips.signs2', 'tips.signs3'],
  },
  {
    labelKey: 'tips.scenarios',
    itemKeys: ['tips.scenarios1', 'tips.scenarios2', 'tips.scenarios3'],
  },
  {
    labelKey: 'tips.examDay',
    itemKeys: ['tips.examDay1', 'tips.examDay2', 'tips.examDay3'],
  },
]

export default function Tips() {
  const { t } = useI18n()

  return (
    <PageTransition>
      <div className="min-h-screen bg-bg px-3 py-6 sm:px-4 sm:py-8">
        <main className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {t('tips.eyebrow')}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-text-primary sm:text-3xl">
                {t('tips.title')}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {t('tips.description')}
              </p>
            </div>
            <Link
              to="/"
              className="min-h-11 rounded-lg bg-surface px-4 py-3 text-center text-sm font-semibold text-text-secondary transition-colors hover:bg-theme-border"
            >
              {t('tips.backToPractice')}
            </Link>
          </div>

          <section className="mt-6 rounded-xl border border-theme-border bg-surface/70 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-primary">{t('tips.checklistTitle')}</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {t('tips.checklistDescription')}
                </p>
              </div>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {t('tips.beforeExamDay')}
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {readinessChecks.map((check, index) => (
                <div key={check.titleKey} className="rounded-lg border border-theme-border bg-bg p-3">
                  <div className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{t(check.titleKey)}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">{t(check.detailKey)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-text-primary">{t('tips.practicalTips')}</h2>
              <p className="text-xs text-text-secondary">
                {t('tips.practicalTipsDescription')}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {tips.map(group => (
                <article key={group.labelKey} className="rounded-xl border border-theme-border bg-bg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-text-primary">{t(group.labelKey)}</h3>
                  <ul className="mt-3 space-y-2">
                    {group.itemKeys.map(itemKey => (
                      <li key={itemKey} className="flex gap-2 text-sm leading-relaxed text-text-secondary">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{t(itemKey)}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-correct/30 bg-correct/10 p-4">
            <h2 className="text-base font-bold text-correct">{t('tips.simpleRuleTitle')}</h2>
            <p className="mt-1 text-sm leading-relaxed text-text-primary">
              {t('tips.simpleRuleDetail')}
            </p>
          </section>
        </main>
      </div>
    </PageTransition>
  )
}
