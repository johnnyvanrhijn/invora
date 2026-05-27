import { Skeleton } from '@/components/ui/skeleton'

export default function DienstenLoading() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="bg-invora-surface rounded-card border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b p-4 last:border-0"
          >
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="ml-auto h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
