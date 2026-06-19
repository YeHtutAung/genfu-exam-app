const tones = {
  default: 'bg-surface text-text-secondary',
  primary: 'bg-primary/10 text-primary',
  correct: 'bg-correct/10 text-correct',
  wrong: 'bg-wrong/10 text-wrong',
  warning: 'bg-warning/10 text-warning',
  ai: 'bg-ai/10 text-ai',
}

export default function Badge({ tone = 'default', className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone] ?? tones.default} ${className}`}>
      {children}
    </span>
  )
}
