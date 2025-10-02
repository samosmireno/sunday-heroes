import { Skeleton } from "@/components/ui/skeleton";

export default function VotePageSkeleton() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-bg p-6 pb-8">
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-16 w-full rounded-lg border-2 border-accent/70 bg-panel-bg shadow-md" />
      </div>
      <div className="relative flex flex-col gap-8 lg:flex-row lg:gap-6">
        {/* Left: Player selection skeleton */}
        <div className="order-1 flex flex-col lg:order-1 lg:flex-[2]">
          <div className="rounded-lg border-2 border-accent/70 bg-panel-bg p-5 shadow-lg">
            <Skeleton className="mb-4 h-8 w-1/2 rounded bg-accent/10" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="mb-2 h-6 w-1/2 rounded bg-accent/10" />
                  {[...Array(4)].map((_, j) => (
                    <Skeleton
                      key={j}
                      className="h-10 w-full rounded-lg border-2 border-accent/60 bg-panel-bg shadow-md"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Right: Guide, Info, Submit skeleton */}
        <div className="order-2 flex flex-col space-y-6 lg:order-2 lg:max-w-md lg:flex-[1]">
          <Skeleton className="h-32 w-full rounded-lg border-2 border-accent/70 bg-panel-bg shadow-md" />
          <Skeleton className="h-32 w-full rounded-lg border-2 border-amber-400/70 bg-panel-bg shadow-md" />
          <Skeleton className="h-16 w-full rounded-lg border-2 border-accent/70 bg-panel-bg shadow-md" />
        </div>
      </div>
    </div>
  );
}
