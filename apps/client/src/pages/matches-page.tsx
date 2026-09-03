import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import CompactPagination from "@/components/pagination/compact-pagination";
import MatchesList from "@/features/matches/matches-list";
import { useAuth } from "@/context/auth-context";
import { useMatches } from "@/features/matches/use-matches";
import { useParams } from "react-router-dom";
import MatchesPageSkeleton from "@/features/matches/matches-page-skeleton";
import { useUrlPagination } from "@/hooks/use-url-pagination";
import { UserResponse } from "@repo/shared-types";
import { useCompetitionInfo } from "@/features/competition/use-competition-info";
import { useSeasonParam } from "@/features/competition/use-season-param";
import { seasonPageShell } from "@/features/competition/season-page-shell";
import Loading from "@/components/ui/loading";

/**
 * All Matches: one competition's list when the URL names a competition, and
 * then it follows the season selector in its header; the user-wide list
 * across competitions otherwise, which knows nothing of seasons.
 */
export default function MatchesPage() {
  const { user } = useAuth() as { user: UserResponse };
  const { competitionId } = useParams<{ competitionId: string }>();
  const { currentPage, setPage, resetPage } = useUrlPagination();
  const {
    competition: info,
    isLoading: isInfoLoading,
    error: infoError,
  } = useCompetitionInfo(competitionId, user.id);
  const seasonSelection = useSeasonParam(info?.seasons);
  const { season, resolved, isAll } = seasonSelection;

  const {
    matches,
    isLoading,
    isPending,
    isError,
    error,
    totalCount,
    totalPages,
  } = useMatches({
    userId: user.id,
    competitionId,
    page: currentPage,
    season,
    enabled: resolved,
  });

  useEffect(() => {
    resetPage();
  }, [competitionId]);

  useEffect(() => {
    if (!isLoading && totalPages > 0 && currentPage > totalPages) {
      setPage(totalPages);
    }
  }, [isLoading, currentPage, totalPages, setPage]);

  // Only a competition's list follows the season selection.
  const seasonAware = competitionId !== undefined;

  const { header, settling } = seasonPageShell(seasonSelection, {
    title: "Matches",
    subtitle: info?.name,
    hasSidebar: true,
    isInfoLoading,
  });

  // The list has nothing yet, and that is no error while the page settles;
  // the user-wide list has no season list to wait on, so it never settles.
  if (isLoading || ((isPending || isError) && settling)) {
    // A season switch keeps the header and its selector in place.
    if (!info) {
      return <MatchesPageSkeleton />;
    }
    return (
      <div className="relative flex-1 p-4 sm:p-5">
        {header}
        <Loading text="Loading matches..." />
      </div>
    );
  }

  // The list read failed, or it waits on a season list that failed and so
  // never goes: either way the page has a failure to show, not an empty list.
  if (isError || (isPending && infoError !== null)) {
    return (
      <div className="relative flex-1 p-4 sm:p-5">
        {header}
        <div className="relative m-0 flex min-h-[50vh] items-center justify-center rounded-lg border-2 border-accent bg-panel-bg p-2 shadow-lg sm:p-4">
          <div className="max-w-md text-center">
            <div className="mb-3 text-red-400 sm:mb-4">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 sm:h-12 sm:w-12" />
              <h3 className="text-base font-medium sm:text-lg">
                Error Loading Matches
              </h3>
            </div>
            <p className="text-sm text-gray-400 sm:text-base">
              {(error ?? infoError)?.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 p-4 sm:p-5">
      {header}

      <div className="relative m-0 min-h-[50vh] rounded-lg border-2 border-accent bg-panel-bg p-2 shadow-lg sm:p-4">
        {matches.length > 0 ? (
          <MatchesList matches={matches} showSeason={seasonAware && isAll} />
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
          onPageChange={setPage}
          className="self-center sm:self-auto"
        />
      </div>
    </div>
  );
}
