export default function Spinner({ size = 'h-8 w-8' }) {
  return (
    <div
      className={`${size} animate-spin rounded-full border-4 border-theme-border border-t-primary`}
      role="status"
    >
      <span className="sr-only">読み込み中…</span>
    </div>
  )
}
