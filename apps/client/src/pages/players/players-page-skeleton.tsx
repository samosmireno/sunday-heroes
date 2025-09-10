import { Skeleton } from "../../components/ui/skeleton";

export default function PlayersPageSkeleton() {
  return (
    <div className="relative flex-1 p-4 sm:p-5">
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-16 w-full rounded-lg border-2 border-accent/70 bg-panel-bg shadow-md" />
      </div>

      <div className="relative mb-5 rounded-lg border-2 border-accent/70 bg-panel-bg shadow-lg sm:mb-6">
        <div className="border-b-2 border-accent/30 p-2 sm:p-3">
          <Skeleton className="h-10 w-full rounded-md bg-accent/10" />
        </div>
      </div>

      <div className="relative min-h-[50vh] rounded-lg border-2 border-accent bg-panel-bg p-3 shadow-lg sm:p-4">
        <ul className="flex flex-col gap-4">
          {[...Array(6)].map((_, i) => (
            <li key={i}>
              <Skeleton className="h-14 w-full rounded-lg border-2 border-accent/60 bg-panel-bg shadow-md" />
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-5 flex flex-col space-y-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <Skeleton className="h-6 w-32 rounded-md bg-accent/10" />
        <Skeleton className="h-10 w-40 rounded-lg border-2 border-accent bg-accent/20" />
      </div>
    </div>
  );
}
