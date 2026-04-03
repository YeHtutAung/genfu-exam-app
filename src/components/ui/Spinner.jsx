export default function Spinner({ size = 'h-8 w-8' }) {
  return (
    <div
      className={`${size} animate-spin rounded-full border-4 border-gray-200 border-t-blue-600`}
      role="status"
    >
      <span className="sr-only">読み込み中…</span>
    </div>
  )
}
