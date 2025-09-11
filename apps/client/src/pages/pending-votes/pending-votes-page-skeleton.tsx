import { Skeleton } from "../../components/ui/skeleton";

export default function PendingVotesPageSkeleton() {
  return (
    <div className="min-h-screen flex-1 bg-bg p-4 sm:p-6">
      <div className="mb-4 sm:mb-8">
        <Skeleton className="h-12 w-full rounded-lg border-2 border-accent/70 bg-panel-bg shadow-md sm:h-16" />
      </div>
      <div className="relative rounded-lg border-2 border-accent bg-panel-bg p-3 shadow-lg sm:p-6">
        <Skeleton className="mb-4 h-6 w-2/3 rounded bg-accent/10 sm:mb-6 sm:h-8 sm:w-1/2" />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-accent/30 text-left text-gray-300">
                <th className="p-1 text-xs sm:p-3 sm:text-base">
                  <Skeleton className="h-5 w-16 rounded bg-accent/10 sm:h-6 sm:w-24" />
                </th>
                <th className="p-1 text-xs sm:p-3 sm:text-base">
                  <Skeleton className="h-5 w-14 rounded bg-accent/10 sm:h-6 sm:w-20" />
                </th>
                <th className="hidden p-1 sm:table-cell sm:p-3 sm:text-base">
                  <Skeleton className="h-5 w-12 rounded bg-accent/10 sm:h-6 sm:w-16" />
                </th>
                <th className="p-1 text-xs sm:p-3 sm:text-base">
                  <Skeleton className="h-5 w-12 rounded bg-accent/10 sm:h-6 sm:w-16" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-accent/10">
                  <td className="p-1 sm:p-3">
                    <Skeleton className="h-5 w-16 rounded bg-accent/10 sm:h-6 sm:w-24" />
                  </td>
                  <td className="p-1 sm:p-3">
                    <Skeleton className="h-5 w-20 rounded bg-accent/10 sm:h-6 sm:w-32" />
                  </td>
                  <td className="hidden p-1 sm:table-cell sm:p-3">
                    <Skeleton className="h-5 w-16 rounded bg-accent/10 sm:h-6 sm:w-20" />
                  </td>
                  <td className="p-1 sm:p-3">
                    <Skeleton className="h-6 w-12 rounded bg-accent/20 sm:h-8 sm:w-16" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
