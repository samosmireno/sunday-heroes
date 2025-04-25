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
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-4 sm:p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent sm:h-12 sm:w-12"></div>
        <p className="text-accent" aria-live="polite">
          Loading competitions...
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 p-4 sm:p-5">
      <header className="relative mb-6 rounded-lg border-2 border-accent bg-panel-bg p-3 shadow-lg sm:mb-7 sm:p-4">
        <div className="flex items-center">
          <SidebarTrigger className="mr-2 sm:mr-3" />
          <h1
            className="text-xl font-bold uppercase tracking-wider text-accent sm:text-2xl"
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            <Trophy className="mr-1.5 inline-block h-5 w-5 sm:mr-2 sm:h-6 sm:w-6" />
            Competitions
          </h1>
        </div>
      </header>

      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <p className="text-sm text-gray-300 sm:text-base">
            Manage your leagues, duels, and tournaments
          </p>
        </div>
        <Button
          onClick={() => navigate(`/create-competition/${user?.id}`)}
          className="transform rounded-lg border-2 border-accent bg-accent/20 px-3 py-1.5 text-sm text-accent shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-accent/30 sm:px-4 sm:py-2"
        >
          <Plus size={16} className="sm:size-18 mr-1.5 sm:mr-2" />
          Create Competition
        </Button>
      </div>

      <div className="mb-5 rounded-lg border-2 border-accent/70 bg-panel-bg shadow-lg sm:mb-6">
        <div className="s border-b-2 border-accent/30 p-2 sm:p-3">
          <SearchViewToggle
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewType={viewType}
            onViewChange={setViewType}
          />
        </div>

        <div className="overflow-x-auto p-2 sm:p-3">
          <div className="flex space-x-1.5 sm:space-x-2">
            <Button
              className={`whitespace-nowrap rounded border-2 px-2 py-1 text-sm font-medium sm:px-3 sm:py-1.5 sm:text-sm ${
                activeFilter === null
                  ? "border-accent bg-accent/20 text-accent"
                  : "border-accent/30 bg-bg/30 text-gray-300 hover:bg-accent/10"
              }`}
              onClick={() => setActiveFilter(null)}
            >
              All
            </Button>
            <Button
              className={`whitespace-nowrap rounded border-2 px-2 py-1 text-sm font-medium sm:px-3 sm:py-1.5 sm:text-sm ${
                activeFilter === CompetitionType.LEAGUE
                  ? "border-league-500 bg-league-700/20 text-league-400"
                  : "border-accent/30 bg-bg/30 text-gray-300 hover:bg-accent/10"
              }`}
              onClick={() => setActiveFilter(CompetitionType.LEAGUE)}
            >
              Leagues
            </Button>
            <Button
              className={`whitespace-nowrap rounded border-2 px-2 py-1 text-sm font-medium sm:px-3 sm:py-1.5 sm:text-sm ${
                activeFilter === CompetitionType.DUEL
                  ? "border-duel-500 bg-duel-700/20 text-duel-400"
                  : "border-accent/30 bg-bg/30 text-gray-300 hover:bg-accent/10"
              }`}
              onClick={() => setActiveFilter(CompetitionType.DUEL)}
            >
              Duels
            </Button>
            <Button
              className={`whitespace-nowrap rounded border-2 px-2 py-1 text-sm font-medium sm:px-3 sm:py-1.5 sm:text-sm ${
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

      <div className="min-h-[50vh] rounded-lg border-2 border-accent bg-panel-bg p-3 shadow-lg sm:p-4">
        {competitions && competitions.length > 0 ? (
          viewType === ViewType.GRID ? (
            <CompetitionGrid competitions={competitions} />
          ) : (
            <CompetitionList competitions={competitions} />
          )
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="text-center text-sm text-gray-400 sm:text-base">
              No competitions found. Create your first competition to get
              started.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col space-y-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="text-sm text-gray-400 sm:text-sm">
          Showing{" "}
          <span className="font-medium text-accent">{competitions.length}</span>{" "}
          {competitions.length !== 1 ? "competitions" : "competition"}
        </div>
        {totalPages > 1 && (
          <Pagination className="self-center sm:self-auto">
            <PaginationContent className="gap-1 sm:gap-2">
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="cursor-pointer border-2 border-accent/50 bg-bg/30 hover:bg-accent/10"
                  />
                </PaginationItem>
              )}
              {Array.from({ length: Math.min(totalPages, 3) }).map(
                (_, index) => {
                  const pageNumber =
                    currentPage > 2 ? currentPage - 1 + index : index + 1;
                  if (pageNumber <= totalPages) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`h-8 w-8 cursor-pointer border-2 sm:h-9 sm:w-9 ${
                            currentPage === pageNumber
                              ? "border-accent bg-accent/20 text-accent"
                              : "border-accent/50 bg-bg/30 text-gray-300 hover:bg-accent/10"
                          }`}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                },
              )}
              {totalPages > 3 && currentPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis className="text-accent" />
                </PaginationItem>
              )}
              {currentPage !== totalPages && totalPages > 3 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(totalPages)}
                    className="h-8 w-8 cursor-pointer border-2 border-accent/50 bg-bg/30 text-gray-300 hover:bg-accent/10 sm:h-9 sm:w-9"
                  >
                    {totalPages}
                  </PaginationLink>
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
