const pathProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const icons = {
  moped: (
    <>
      <circle cx="6" cy="17" r="3" {...pathProps} />
      <circle cx="18" cy="17" r="3" {...pathProps} />
      <path d="M8.5 17h4.5l2-5h-4l-2.5 5Z" {...pathProps} />
      <path d="M13 12h3l2 5" {...pathProps} />
      <path d="M16 9h3" {...pathProps} />
    </>
  ),
  motorcycle: (
    <>
      <circle cx="5" cy="17" r="3" {...pathProps} />
      <circle cx="19" cy="17" r="3" {...pathProps} />
      <path d="M8 17h3l4-6h-4l-3 6Z" {...pathProps} />
      <path d="M15 11l4 6" {...pathProps} />
      <path d="M15 8h4" {...pathProps} />
    </>
  ),
  car: (
    <>
      <path d="M5 16h14l-1.5-5h-11L5 16Z" {...pathProps} />
      <path d="M7 16v2" {...pathProps} />
      <path d="M17 16v2" {...pathProps} />
      <circle cx="7.5" cy="18" r="1.5" {...pathProps} />
      <circle cx="16.5" cy="18" r="1.5" {...pathProps} />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" {...pathProps} />
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 8H20" {...pathProps} />
    </>
  ),
  celebration: (
    <>
      <path d="m5 21 4-12 6 6-10 6Z" {...pathProps} />
      <path d="M14 4h.01" {...pathProps} />
      <path d="M19 9h.01" {...pathProps} />
      <path d="M16 7l2-2" {...pathProps} />
      <path d="M13 11l6-6" {...pathProps} />
    </>
  ),
  focus: (
    <>
      <circle cx="12" cy="12" r="7" {...pathProps} />
      <circle cx="12" cy="12" r="3" {...pathProps} />
      <path d="M12 2v3" {...pathProps} />
      <path d="M12 19v3" {...pathProps} />
      <path d="M2 12h3" {...pathProps} />
      <path d="M19 12h3" {...pathProps} />
    </>
  ),
  spark: (
    <>
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" {...pathProps} />
      <path d="M5 17l.7 2.3L8 20l-2.3.7L5 23l-.7-2.3L2 20l2.3-.7L5 17Z" {...pathProps} />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 18h6" {...pathProps} />
      <path d="M10 22h4" {...pathProps} />
      <path d="M8.5 14.5A6 6 0 1 1 15.5 14c-.9.7-1.5 1.7-1.5 3h-4c0-1.2-.6-2-1.5-2.5Z" {...pathProps} />
    </>
  ),
  bookmark: (
    <>
      <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" {...pathProps} />
    </>
  ),
}

export default function Icon({ name, className = 'h-4 w-4', title }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
      {title && <title>{title}</title>}
      {icons[name] ?? icons.focus}
    </svg>
  )
}
