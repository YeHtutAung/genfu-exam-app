import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'

export default function Breadcrumbs({ items = [], className = '' }) {
  const { t } = useI18n()
  const allItems = [{ label: t('common.home'), to: '/' }, ...items]

  return (
    <nav aria-label="Breadcrumb" className={`mb-4 text-sm text-text-secondary ${className}`}>
      <ol className="flex flex-wrap items-center gap-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.to && !isLast ? (
                <Link to={item.to} className="rounded px-1 text-primary hover:text-primary-hover">
                  {item.label}
                </Link>
              ) : (
                <span className="px-1 text-text-secondary" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
