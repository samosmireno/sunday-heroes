import { Skeleton } from "../../components/ui/skeleton";

export default function PendingVotesPageSkeleton() {
  return (
    <div className="min-h-screen flex-1 bg-bg p-6">
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-16 w-full rounded-lg border-2 border-accent/70 bg-panel-bg shadow-md" />
      </div>
      <div className="relative rounded-lg border-2 border-accent bg-panel-bg p-6 shadow-lg">
        <Skeleton className="mb-6 h-8 w-1/2 rounded bg-accent/10" />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-accent/30 text-left text-gray-300">
                <th className="p-1 text-sm sm:p-3 sm:text-base">
                  <Skeleton className="h-6 w-24 rounded bg-accent/10" />
                </th>
                <th className="p-1 text-sm sm:p-3 sm:text-base">
                  <Skeleton className="h-6 w-20 rounded bg-accent/10" />
                </th>
                <th className="hidden p-1 text-sm sm:block sm:p-3 sm:text-base">
                  <Skeleton className="h-6 w-16 rounded bg-accent/10" />
                </th>
                <th className="p-1 text-sm sm:p-3 sm:text-base">
                  <Skeleton className="h-6 w-16 rounded bg-accent/10" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-accent/10">
                  <td className="p-1 sm:p-3">
                    <Skeleton className="h-6 w-24 rounded bg-accent/10" />
                  </td>
                  <td className="p-1 sm:p-3">
                    <Skeleton className="h-6 w-32 rounded bg-accent/10" />
                  </td>
                  <td className="hidden p-1 sm:table-cell sm:p-3">
                    <Skeleton className="h-6 w-20 rounded bg-accent/10" />
                  </td>
                  <td className="p-1 sm:p-3">
                    <Skeleton className="h-8 w-16 rounded bg-accent/20" />
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
