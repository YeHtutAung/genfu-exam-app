export default function Card({ as: Component = 'div', className = '', children, ...props }) {
  return (
    <Component
      className={`rounded-2xl border border-theme-border bg-surface p-4 shadow-[0_1px_2px_rgba(23,21,15,0.04)] ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
