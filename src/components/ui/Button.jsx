const variants = {
  primary: 'bg-primary text-white shadow-sm shadow-primary/25 hover:bg-primary-hover',
  secondary: 'bg-surface text-text-secondary hover:bg-theme-border',
  outline: 'border border-theme-border bg-bg text-text-secondary hover:bg-surface',
  success: 'bg-correct text-white hover:bg-correct/90',
  danger: 'bg-wrong text-white hover:bg-wrong/90',
  ghost: 'text-primary hover:bg-primary/10',
}

const sizes = {
  sm: 'min-h-10 px-3 py-2 text-xs',
  md: 'min-h-11 px-4 py-2.5 text-sm',
  lg: 'min-h-12 px-5 py-3 text-base',
}

function buttonClasses({ variant = 'primary', size = 'md', className = '' } = {}) {
  return `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`
}

export default function Button({ as: Component = 'button', className = '', children, variant = 'primary', size = 'md', ...props }) {
  return (
    <Component
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {children}
    </Component>
  )
}
