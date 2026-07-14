export default function BrandMark({ className = 'h-10 w-10', compact = false }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-[18px] bg-[#17150F] ${className}`} aria-hidden="true">
      <span className={`flex ${compact ? 'gap-1' : 'gap-1.5'}`}>
        <i className={`${compact ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5'} rounded-full bg-wrong`} />
        <i className={`${compact ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5'} rounded-full bg-warning`} />
        <i className={`${compact ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5'} rounded-full bg-correct`} />
      </span>
    </span>
  )
}
