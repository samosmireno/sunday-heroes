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

export default function CompetitionListPage() {
  const [activeFilter, setActiveFilter] = useState<CompetitionType | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewType, setViewType] = useState<ViewType>(ViewType.GRID);

  const { user } = useAuth();
  const { competitions } = user
    ? useCompetitions(user.id)
    : { competitions: [] };

  const filteredCompetitions = (competitions ?? []).filter((comp) => {
    const matchesSearch = comp.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (activeFilter === null) return matchesSearch;
    if (activeFilter === CompetitionType.LEAGUE)
      return comp.type === CompetitionType.LEAGUE && matchesSearch;
    if (activeFilter === CompetitionType.DUEL)
      return comp.type === CompetitionType.DUEL && matchesSearch;
    if (activeFilter === CompetitionType.KNOCKOUT)
      return comp.type === CompetitionType.KNOCKOUT && matchesSearch;

    return matchesSearch;
  });

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
          <button className="mt-4 flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 md:mt-0">
            <Plus size={18} className="mr-2" />
            Create New Competition
          </button>
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
              <button
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${activeFilter === null ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setActiveFilter(null)}
              >
                All
              </button>
              <button
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${activeFilter === CompetitionType.LEAGUE ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setActiveFilter(CompetitionType.LEAGUE)}
              >
                Leagues
              </button>
              <button
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${activeFilter === CompetitionType.DUEL ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setActiveFilter(CompetitionType.DUEL)}
              >
                Duels
              </button>
              <button
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${activeFilter === CompetitionType.KNOCKOUT ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setActiveFilter(CompetitionType.KNOCKOUT)}
              >
                Knockouts
              </button>
            </div>
          </div>
        </div>

        {viewType === ViewType.GRID ? (
          <CompetitionGrid competitions={filteredCompetitions ?? []} />
        ) : (
          <CompetitionList competitions={filteredCompetitions ?? []} />
        )}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">{filteredCompetitions.length}</span>{" "}
            competitions
          </div>
          <div className="flex space-x-1">
            <button className="rounded-lg border-2 border-gray-300 px-3 py-1 text-sm text-gray-600">
              Previous
            </button>
            <button className="rounded-lg border-2 border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-600">
              1
            </button>
            <button className="rounded-lg border-2 border-gray-300 px-3 py-1 text-sm text-gray-600">
              2
            </button>
            <button className="rounded-lg border-2 border-gray-300 px-3 py-1 text-sm text-gray-600">
              Next
            </button>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
