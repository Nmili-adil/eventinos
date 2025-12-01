import { Skeleton } from "@/components/ui/skeleton"

const EventsTableSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-48" />
    <div className="border border-slate-300 rounded-xl overflow-hidden">
      <div className="grid grid-cols-5 bg-muted px-4 py-2 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
      <div className="divide-y divide-slate-300">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid grid-cols-5 gap-4 px-4 py-3">
            {Array.from({ length: 5 }).map((__, inner) => (
              <Skeleton key={inner} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default EventsTableSkeleton