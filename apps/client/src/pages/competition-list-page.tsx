import { useState } from "react";
import { Plus } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/features/sidebar/app-sidebar";
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

  console.log(totalPages);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Competitions</h1>
            <p className="text-gray-500">
              Manage your leagues, duels, and tournaments
            </p>
          </div>
          <Button
            onClick={() => navigate(`/create-competition/${user?.id}`)}
            className="mt-4 flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 md:mt-0"
          >
            <Plus size={18} className="mr-2" />
            Create New Competition
          </Button>
        </div>
        <div className="mb-6 rounded-xl bg-white shadow">
          <SearchViewToggle
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewType={viewType}
            onViewChange={setViewType}
          />

          <div className="overflow-x-auto p-2">
            <div className="flex space-x-2">
              <Button
                className={`whitespace-nowrap rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium ${activeFilter === null ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setActiveFilter(null)}
              >
                All
              </Button>
              <Button
                className={`whitespace-nowrap rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium ${activeFilter === CompetitionType.LEAGUE ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setActiveFilter(CompetitionType.LEAGUE)}
              >
                Leagues
              </Button>
              <Button
                className={`whitespace-nowrap rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium ${activeFilter === CompetitionType.DUEL ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setActiveFilter(CompetitionType.DUEL)}
              >
                Duels
              </Button>
              <Button
                className={`whitespace-nowrap rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium ${activeFilter === CompetitionType.KNOCKOUT ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setActiveFilter(CompetitionType.KNOCKOUT)}
              >
                Knockouts
              </Button>
            </div>
          </div>
        </div>

        {viewType === ViewType.GRID ? (
          <CompetitionGrid competitions={competitions ?? []} />
        ) : (
          <CompetitionList competitions={competitions ?? []} />
        )}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{competitions.length}</span>{" "}
            {competitions.length > 1 ? "competitions" : "competition"}
          </div>
          <div className="flex space-x-1">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="cursor-pointer border-2 border-gray-200 hover:bg-gray-200"
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => setCurrentPage(index + 1)}
                      className="cursor-pointer border-2 border-gray-200 hover:bg-gray-200"
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                {currentPage !== totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="cursor-pointer border-2 border-gray-200 hover:bg-gray-200"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
