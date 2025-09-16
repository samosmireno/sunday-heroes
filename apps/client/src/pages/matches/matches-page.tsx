import { useState } from "react";
import Header from "../../components/ui/header";
import Background from "../../components/ui/background";
import CompactPagination from "../../components/features/pagination/compact-pagination";
import MatchesList from "../../components/features/matches/matches-list";
import { useAuth } from "../../context/auth-context";
import { useMatches } from "../../hooks/use-matches";
import { useParams } from "react-router-dom";
import MatchesPageSkeleton from "./matches-page-skeleton";

export default function MatchesPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { user } = useAuth();
  const { competitionId } = useParams();

  const { matches, isLoading, totalCount, totalPages } = useMatches({
    userId: user?.id || "",
    competitionId: competitionId || "",
    page: currentPage,
  });

  console.log(currentPage, totalPages, totalCount);

  if (isLoading) {
    return <MatchesPageSkeleton />;
  }

  return (
    <div className="relative flex-1 p-4 sm:p-5">
      <Background />
      <Header title="Matches" hasSidebar={true} />

      <div className="relative m-0 min-h-[50vh] rounded-lg border-2 border-accent bg-panel-bg p-2 shadow-lg sm:p-4">
        {matches.length > 0 ? (
          <MatchesList matches={matches} />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="text-center text-sm text-gray-400 sm:text-base">
              No matches found. Create your first match to get started.
            </p>
          </div>
        )}
      </div>

      <div className="relative mt-5 flex flex-col space-y-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="text-sm text-gray-400 sm:text-sm">
          Showing{" "}
          <span className="font-medium text-accent">{matches.length}</span> of{" "}
          <span className="font-medium text-accent">{totalCount}</span>{" "}
          {totalCount !== 1 ? "matches" : "match"}
        </div>
        <CompactPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="self-center sm:self-auto"
        />
      </div>
    </div>
  );
}
