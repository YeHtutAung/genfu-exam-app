const variants = {
  primary: 'bg-primary text-white shadow-sm shadow-primary/25 hover:bg-primary-hover',
  secondary: 'bg-[#EAE5D8] text-text-primary hover:bg-[#DDD6C7]',
  outline: 'border-[1.5px] border-[#D9D2C4] bg-surface text-text-primary hover:border-primary/50 hover:bg-primary/5',
  success: 'bg-correct text-white shadow-sm shadow-correct/20 hover:bg-correct/90',
  danger: 'bg-wrong text-white shadow-sm shadow-wrong/20 hover:bg-wrong/90',
  ghost: 'text-primary hover:bg-primary/10',
}

const sizes = {
  sm: 'min-h-10 px-3 py-2 text-xs',
  md: 'min-h-12 px-4 py-2.5 text-[15px]',
  lg: 'min-h-12 px-5 py-3 text-base',
}

function buttonClasses({ variant = 'primary', size = 'md', className = '' } = {}) {
  return `inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`
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
