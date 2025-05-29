import { useState } from "react";
import { useAuth } from "../context/auth-context";
import { ViewType } from "../types/types";
import { SearchViewToggle } from "../components/features/match-list/search-view-toggle";
import useDebounce from "../hooks/use-debounce";
import CompactPagination from "../components/features/pagination/compact-pagination";
import Header from "../components/ui/header";
import Loading from "../components/ui/loading";
import Background from "../components/ui/background";
import { usePlayers } from "../hooks/use-players";
import PlayersList from "../components/features/player-list/player-list";

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { user } = useAuth();
  const { players, isLoading, totalPages } = user
    ? usePlayers({
        userId: user.id,
        page: currentPage - 1,
        searchTerm: debouncedQuery,
      })
    : { players: [], totalPages: 1, isLoading: false };

  const handleInvitePlayer = (playerId: string, email?: string) => {
    // TODO: Implement invite functionality
    console.log("Inviting player:", playerId, email);
  };

  if (isLoading) {
    return <Loading text="Loading players..." />;
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
      </div>

      <div className="relative min-h-[50vh] rounded-lg border-2 border-accent bg-panel-bg p-3 shadow-lg sm:p-4">
        {players && players.length > 0 ? (
          <PlayersList players={players} onInvite={handleInvitePlayer} />
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
          onPageChange={setCurrentPage}
          className="self-center sm:self-auto"
        />
      </div>
    </div>
  );
}
