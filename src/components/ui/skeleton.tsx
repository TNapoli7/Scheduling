interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-stone-200 rounded ${className}`}
    />
  );
}

/** Skeleton for a stats card (icon + text) */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/60 p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for a table/grid page */
export function SkeletonTable({ rows = 5, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="border border-stone-200/60 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="bg-stone-50 px-3 py-3">
        <Skeleton className="h-4 w-32" />
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-2 px-3 py-2.5 border-t border-stone-100">
          <Skeleton className="h-4 w-28 flex-shrink-0" />
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 w-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton for a list of items */
export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-stone-200/60 p-4 flex items-center gap-3 shadow-sm">
          <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
