import { Link } from 'react-router-dom'
import PageTransition from '../components/ui/PageTransition'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
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
          <Breadcrumbs items={[{ label: t('tips.title') }]} />
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
            <Button
              as={Link}
              to="/"
              variant="secondary"
              className="rounded-lg"
            >
              {t('tips.backToPractice')}
            </Button>
          </div>

          <Card as="section" className="mt-6 bg-surface/70 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-primary">{t('tips.checklistTitle')}</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {t('tips.checklistDescription')}
                </p>
              </div>
              <Badge tone="primary" className="border border-primary/20 px-3 py-1 font-semibold">
                {t('tips.beforeExamDay')}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3">
              {readinessChecks.map((check, index) => (
                <Card key={check.titleKey} className="rounded-lg p-3">
                  <div className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{t(check.titleKey)}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">{t(check.detailKey)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <section className="mt-6">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-text-primary">{t('tips.practicalTips')}</h2>
              <p className="text-xs text-text-secondary">
                {t('tips.practicalTipsDescription')}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {tips.map(group => (
                <Card key={group.labelKey} as="article">
                  <h3 className="text-sm font-semibold text-text-primary">{t(group.labelKey)}</h3>
                  <ul className="mt-3 space-y-2">
                    {group.itemKeys.map(itemKey => (
                      <li key={itemKey} className="flex gap-2 text-sm leading-relaxed text-text-secondary">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{t(itemKey)}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
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
