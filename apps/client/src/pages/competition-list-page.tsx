import { useState } from "react";
import { Plus } from "lucide-react";
import CompetitionGrid from "../components/features/competition-list/competition-grid";
import CompetitionList from "../components/features/competition-list/competition-list";
import { useAuth } from "../context/auth-context";
import { useCompetitions } from "../hooks/use-competitions";
import { ViewType } from "../types/types";
import { CompetitionType } from "@repo/shared-types";
import { SearchViewToggle } from "../components/features/match-list/search-view-toggle";
import useDebounce from "../hooks/use-debounce";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import CompactPagination from "../components/features/pagination/compact-pagination";
import FilterTabs from "../components/features/competition-list/filter-tabs";
import Header from "../components/ui/header";
import Loading from "../components/ui/loading";

const filterOptions = [
  { value: null, label: "All" },
  {
    value: CompetitionType.LEAGUE,
    label: "Leagues",
    color: "border-league-500 bg-league-700/20 text-league-400",
  },
  {
    value: CompetitionType.DUEL,
    label: "Duels",
    color: "border-duel-500 bg-duel-700/20 text-duel-400",
  },
  // {
  //   value: CompetitionType.KNOCKOUT,
  //   label: "Knockouts",
  //   color: "border-knockout-500 bg-knockout-700/20 text-knockout-400",
  // },
];

export default function CompetitionListPage() {
  const [activeFilter, setActiveFilter] = useState<CompetitionType | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewType, setViewType] = useState<ViewType>(ViewType.LIST);
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { user } = useAuth();
  const navigate = useNavigate();

  const { competitions, isLoading, totalPages } = useCompetitions({
    id: user?.id || "",
    page: currentPage - 1,
    type: activeFilter,
    searchTerm: debouncedQuery,
  });

  if (isLoading) {
    return <Loading text="Loading competitions..." />;
  }

  return (
    <div className="relative flex-1 p-4 sm:p-5">
      <Header title="Competitions" hasSidebar={true} />

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
          <FilterTabs
            options={filterOptions}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
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
