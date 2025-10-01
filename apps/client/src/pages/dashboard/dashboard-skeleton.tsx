import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="relative flex flex-1 flex-col p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-16 w-full rounded-lg border-2 border-accent/70 bg-panel-bg shadow-md" />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 lg:gap-4 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-24 rounded-lg border-2 border-accent/60 bg-panel-bg p-4 shadow-md"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 pb-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-lg border-2 border-accent/70 bg-panel-bg shadow-lg" />
        <Skeleton className="h-64 rounded-lg border-2 border-accent/70 bg-panel-bg shadow-lg" />
      </div>
    </div>
  );
}
