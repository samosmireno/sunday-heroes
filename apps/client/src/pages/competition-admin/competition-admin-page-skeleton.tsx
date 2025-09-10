import { Skeleton } from "../../components/ui/skeleton";

export default function CompetitionAdminPageSkeleton() {
  return (
    <div className="relative flex-1 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Tabs skeleton */}
      <div className="relative mb-4 w-full sm:mb-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-2 overflow-x-auto rounded-lg bg-bg/70 p-1">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-28 rounded-md bg-accent/20" />
            ))}
          </div>
          <Skeleton className="ml-2 h-8 w-10 rounded-md bg-accent/20" />
        </div>
      </div>

      {/* Main panel skeleton */}
      <div className="relative rounded-lg border-2 border-accent bg-panel-bg p-3 shadow-lg sm:p-4 md:p-5 lg:p-6">
        {/* Section header skeleton */}
        <Skeleton className="mb-4 h-6 w-1/3 rounded bg-accent/10" />

        {/* List skeleton */}
        <div className="space-y-4 sm:space-y-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-12 w-full rounded-lg border-2 border-accent/60 bg-panel-bg shadow-md"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
