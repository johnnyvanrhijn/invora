import { Skeleton } from '@/components/ui/skeleton'

export default function ClientenLoading() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-60" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="bg-invora-surface rounded-card border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b p-4 last:border-0"
          >
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="ml-auto h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
