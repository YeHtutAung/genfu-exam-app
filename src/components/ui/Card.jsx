export default function Card({ as: Component = 'div', className = '', children, ...props }) {
  return (
    <Component
      className={`rounded-xl border border-theme-border bg-bg p-4 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
