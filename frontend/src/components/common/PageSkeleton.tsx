import { Skeleton } from "@/components/ui/skeleton";

/** Route-level loading placeholder for lazy-loaded pages. */
export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300" aria-busy="true" aria-label="Loading page">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[116px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[420px] rounded-xl" />
    </div>
  );
}
