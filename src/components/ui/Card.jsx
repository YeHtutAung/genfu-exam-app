export default function Card({ as: Component = 'div', className = '', children, ...props }) {
  return (
    <Component
      className={`rounded-xl border border-theme-border/80 bg-bg/90 p-4 shadow-sm shadow-slate-900/5 backdrop-blur ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
