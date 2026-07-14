import { useState } from 'react'
import { explain } from '../../lib/api'
import Skeleton from '../ui/Skeleton'
import Icon from '../ui/Icon'
import Button from '../ui/Button'
import { useI18n } from '../../lib/i18n'

export default function AIExplanation({ questionJp, hintJp }) {
  const { t } = useI18n()
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [requested, setRequested] = useState(false)

  const handleRequest = async () => {
    setLoading(true)
    setError(null)
    setRequested(true)

    try {
      const text = await explain(questionJp, hintJp)
      setExplanation(text)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-[#E3D9FB] bg-[#F5F1FE] p-4 shadow-sm">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-ai text-white">
          <Icon name="spark" className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-ai">{t('ai.title')}</span>
      </div>

      {/* Not yet requested */}
      {!requested && (
        <Button
          onClick={handleRequest}
          variant="ghost"
          size="sm"
          className="rounded-lg bg-ai/10 text-ai hover:bg-ai/20"
        >
          {t('ai.ask')}
        </Button>
      )}

      {/* Loading skeleton */}
      {requested && loading && (
        <div className="space-y-2 mt-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      )}

      {/* Error */}
      {requested && !loading && error && (
        <p className="text-sm text-wrong mt-2">
          {t('ai.failed', { error })}
        </p>
      )}

      {/* Explanation text */}
      {requested && !loading && !error && explanation && (
        <p className="mt-2 whitespace-pre-wrap font-jp text-sm leading-relaxed text-text-primary">
          {explanation}
        </p>
      )}
    </div>
  )
}
