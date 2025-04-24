import { useState } from "react";
import { Plus, Trophy } from "lucide-react";
import { SidebarTrigger } from "../components/ui/sidebar";
import CompetitionGrid from "../components/features/competition-list/competition-grid";
import CompetitionList from "../components/features/competition-list/competition-list";
import { useAuth } from "../context/auth-context";
import { useCompetitions } from "../hooks/use-competitions";
import { ViewType } from "../types/types";
import { CompetitionType } from "@repo/logger";
import { SearchViewToggle } from "../components/features/match-list/search-view-toggle";
import useDebounce from "../hooks/use-debounce";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CompetitionListPage() {
  const [activeFilter, setActiveFilter] = useState<CompetitionType | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewType, setViewType] = useState<ViewType>(ViewType.GRID);
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { competitions, isLoading, totalPages } = user
    ? useCompetitions({
        id: user.id,
        page: currentPage - 1,
        type: activeFilter,
        searchTerm: debouncedQuery,
      })
    : { competitions: [], totalPages: 1 };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
        <p className="text-accent" aria-live="polite">
          Loading competitions...
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 p-6">
      <header className="relative mb-8 rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg">
        <div className="flex items-center">
          <SidebarTrigger className="mr-3" />
          <h1
            className="text-3xl font-bold uppercase tracking-wider text-accent"
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            <Trophy className="mr-2 inline-block h-7 w-7" />
            Competitions
          </h1>
        </div>
      </header>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-gray-300">
            Manage your leagues, duels, and tournaments
          </p>
        </div>
        <Button
          onClick={() => navigate(`/create-competition/${user?.id}`)}
          className="transform rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 text-accent shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-accent/30"
        >
          <Plus size={18} className="mr-2" />
          Create Competition
        </Button>
      </div>

      <div className="mb-6 rounded-lg border-2 border-accent/70 bg-panel-bg shadow-lg">
        <div className="border-b-2 border-accent/30 p-3 sm:p-4">
          <SearchViewToggle
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewType={viewType}
            onViewChange={setViewType}
          />
        </div>

        <div className="overflow-x-auto p-3 sm:p-4">
          <div className="flex space-x-2">
            <Button
              className={`whitespace-nowrap rounded border-2 px-3 py-1.5 text-sm font-medium ${
                activeFilter === null
                  ? "border-accent bg-accent/20 text-accent"
                  : "border-accent/30 bg-bg/30 text-gray-300 hover:bg-accent/10"
              }`}
              onClick={() => setActiveFilter(null)}
            >
              All
            </Button>
            <Button
              className={`whitespace-nowrap rounded border-2 px-3 py-1.5 text-sm font-medium ${
                activeFilter === CompetitionType.LEAGUE
                  ? "border-league-500 bg-league-700/20 text-league-400"
                  : "border-accent/30 bg-bg/30 text-gray-300 hover:bg-accent/10"
              }`}
              onClick={() => setActiveFilter(CompetitionType.LEAGUE)}
            >
              Leagues
            </Button>
            <Button
              className={`whitespace-nowrap rounded border-2 px-3 py-1.5 text-sm font-medium ${
                activeFilter === CompetitionType.DUEL
                  ? "border-duel-500 bg-duel-700/20 text-duel-400"
                  : "border-accent/30 bg-bg/30 text-gray-300 hover:bg-accent/10"
              }`}
              onClick={() => setActiveFilter(CompetitionType.DUEL)}
            >
              Duels
            </Button>
            <Button
              className={`whitespace-nowrap rounded border-2 px-3 py-1.5 text-sm font-medium ${
                activeFilter === CompetitionType.KNOCKOUT
                  ? "border-knockout-500 bg-knockout-700/20 text-knockout-400"
                  : "border-accent/30 bg-bg/30 text-gray-300 hover:bg-accent/10"
              }`}
              onClick={() => setActiveFilter(CompetitionType.KNOCKOUT)}
            >
              Knockouts
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-[50vh] rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg sm:p-6">
        {competitions && competitions.length > 0 ? (
          viewType === ViewType.GRID ? (
            <CompetitionGrid competitions={competitions} />
          ) : (
            <CompetitionList competitions={competitions} />
          )
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="text-gray-400">
              No competitions found. Create your first competition to get
              started.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Showing{" "}
          <span className="font-medium text-accent">{competitions.length}</span>{" "}
          {competitions.length !== 1 ? "competitions" : "competition"}
        </div>
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="cursor-pointer border-2 border-accent/50 bg-bg/30 hover:bg-accent/10"
                  />
                </PaginationItem>
              )}
              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    onClick={() => setCurrentPage(index + 1)}
                    className={`cursor-pointer border-2 ${
                      currentPage === index + 1
                        ? "border-accent bg-accent/20 text-accent"
                        : "border-accent/50 bg-bg/30 text-gray-300 hover:bg-accent/10"
                    }`}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis className="text-accent" />
                </PaginationItem>
              )}
              {currentPage !== totalPages && (
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="cursor-pointer border-2 border-accent/50 bg-bg/30 hover:bg-accent/10"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
