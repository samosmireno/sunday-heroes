import { Skeleton } from "@/components/ui/skeleton";

export default function CompetitionListSkeleton() {
  return (
    <div className="relative flex-1 p-4 sm:p-5">
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-16 w-full rounded-lg border-2 border-accent/70 bg-panel-bg shadow-md" />
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Skeleton className="h-6 w-1/2 rounded-md bg-accent/10" />
        <Skeleton className="h-10 w-40 rounded-lg border-2 border-accent bg-accent/20" />
      </div>

      <div className="mb-5 rounded-lg border-2 border-accent/70 bg-panel-bg shadow-lg sm:mb-6">
        <Skeleton className="h-12 w-full rounded-t-lg border-b-2 border-accent/30 bg-panel-bg" />
        <Skeleton className="m-3 h-10 w-1/2 rounded-md bg-accent/10" />
      </div>

      <div className="min-h-[50vh] rounded-lg border-2 border-accent bg-panel-bg p-3 shadow-lg sm:p-4">
        <ul className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <li key={i}>
              <Skeleton className="h-20 w-full rounded-lg border-2 border-accent/60 bg-panel-bg shadow-md" />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex flex-col space-y-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <Skeleton className="h-6 w-32 rounded-md bg-accent/10" />
        <Skeleton className="h-10 w-40 rounded-lg border-2 border-accent bg-accent/20" />
      </div>
    </div>
  );
}
