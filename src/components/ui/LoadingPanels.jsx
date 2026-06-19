import Skeleton from './Skeleton'

export function TestListSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading tests">
      {[0, 1, 2].map(item => (
        <div key={item} className="rounded-xl border border-theme-border bg-bg p-4 shadow-sm">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/2" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AdminTableSkeleton() {
  return (
    <div className="rounded-lg border border-theme-border p-4" aria-label="Loading table">
      <Skeleton className="h-4 w-1/3" />
      {[0, 1, 2, 3].map(item => (
        <div key={item} className="mt-4 grid grid-cols-4 gap-3">
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
        </div>
      ))}
    </div>
  )
}
