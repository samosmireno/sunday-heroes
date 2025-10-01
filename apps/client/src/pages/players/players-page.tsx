import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { ViewType } from "@/components/features/search-view-toggle/types";
import { SearchViewToggle } from "@/components/features/search-view-toggle/search-view-toggle";
import useDebounce from "@/hooks/use-debounce";
import CompactPagination from "@/components/features/pagination/compact-pagination";
import Header from "@/components/ui/header";
import Background from "@/components/ui/background";
import { usePlayers } from "@/hooks/use-players";
import PlayersList from "@/components/features/player-list/player-list";
import PlayersPageSkeleton from "./players-page-skeleton";
import { useUrlPagination } from "@/hooks/use-url-pagination";
import FilterTabs from "@/components/features/competition-list/filter-tabs";
import { playerTabs, PlayerTabsType } from "./types";

const filterOptions = [
  {
    value: playerTabs.ADMIN,
    label: "Managed",
  },
  {
    value: playerTabs.PLAYED_WITH,
    label: "Played With",
  },
];

export default function PlayersPage() {
  const [activeFilter, setActiveFilter] = useState<PlayerTabsType>("admin");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { currentPage, setPage } = useUrlPagination();
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { user } = useAuth();

  const { players, isLoading, totalPages } = usePlayers({
    userId: user?.id || "",
    page: currentPage - 1,
    searchTerm: debouncedQuery,
    activeFilter,
  });

  useEffect(() => {
    if (!isLoading && totalPages > 0 && currentPage > totalPages) {
      setPage(totalPages);
    }
  }, [isLoading, currentPage, totalPages, setPage]);

  if (isLoading) {
    return <PlayersPageSkeleton />;
  }

  return (
    <div className="relative flex-1 p-4 sm:p-5">
      <Background />
      <Header title="Players" hasSidebar={true} />

      <div className="relative mb-5 rounded-lg border-2 border-accent/70 bg-panel-bg shadow-lg sm:mb-6">
        <div className="border-b-2 border-accent/30 p-2 sm:p-3">
          <SearchViewToggle
            placeholder="Search players..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewType={ViewType.LIST}
          />
        </div>
        <div className="overflow-x-auto p-2 sm:p-3">
          <FilterTabs
            options={filterOptions}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
      </div>

      <div className="relative min-h-[50vh] rounded-lg border-2 border-accent bg-panel-bg p-3 shadow-lg sm:p-4">
        {players && players.length > 0 ? (
          <PlayersList players={players} activeFilter={activeFilter} />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="text-center text-sm text-gray-400 sm:text-base">
              {debouncedQuery
                ? "No players found matching your search."
                : "No players found. Add players to competitions to get started."}
            </p>
          </div>
        )}
      </div>

      <div className="relative mt-5 flex flex-col space-y-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="text-sm text-gray-400 sm:text-sm">
          Showing{" "}
          <span className="font-medium text-accent">{players.length}</span>{" "}
          {players.length !== 1 ? "players" : "player"}
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
