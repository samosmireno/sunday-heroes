// PROTOTYPE — throwaway. Bits every variant page needs.
import { ReactNode, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUrlPagination } from "@/hooks/use-url-pagination";
import CompactPagination from "@/components/pagination/compact-pagination";
import {
  ProtoModel,
  SeasonSelection,
  computePlayerTotals,
  computeStandings,
  matchesFor,
  seasonByNumber,
  toMatchPageRow,
} from "./fake-seasons";
import MatchesTableView from "./matches-table-view";

export interface VariantPageProps {
  model: ProtoModel;
  hasSidebar: boolean;
}

export function useLeagueTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "standings";
  const setTab = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    setSearchParams(params);
  };
  return { activeTab, setTab };
}

export function useScope(model: ProtoModel, selection: SeasonSelection) {
  const scope = useMemo(() => matchesFor(model, selection), [model, selection]);
  const completed = useMemo(() => scope.filter((m) => m.isCompleted).length, [scope]);
  const standings = useMemo(() => computeStandings(model), [model]);
  const players = useMemo(() => computePlayerTotals(scope), [scope]);
  return { scope, completed, standings, players };
}

export function TabCard({ title, right, children }: { title: ReactNode; right?: ReactNode; children: ReactNode }) {
  return (
    <Card className="border-2 border-accent/30 bg-panel-bg shadow-md">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg text-accent sm:text-xl">{title}</CardTitle>
          {right}
        </div>
      </CardHeader>
      <CardContent className="max-w-full overflow-hidden p-3 sm:p-6">{children}</CardContent>
    </Card>
  );
}

export const TAB_TRIGGER_CLASS = "text-xs data-[state=active]:bg-accent/20 data-[state=active]:text-accent sm:text-sm";

// The All Matches table body, paginated client-side over the scope.
export function MatchesBody({
  model,
  selection,
  showSeasonColumn,
}: {
  model: ProtoModel;
  selection: SeasonSelection;
  showSeasonColumn: boolean;
}) {
  const { currentPage, setPage } = useUrlPagination();
  const perPage = 10;
  const scope = useMemo(
    () =>
      [...matchesFor(model, selection)].sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }),
    [model, selection],
  );
  const totalPages = Math.max(1, Math.ceil(scope.length / perPage));
  const page = Math.min(currentPage, totalPages);
  const rows = scope.slice((page - 1) * perPage, page * perPage).map((m) => toMatchPageRow(m, model));
  const seasonOf = (id: string) => seasonByNumber(model, scope.find((m) => m.id === id)!.seasonNumber)!;

  return (
    <>
      <div className="relative m-0 min-h-[50vh] rounded-lg border-2 border-accent bg-panel-bg p-2 shadow-lg sm:p-4">
        {rows.length > 0 ? (
          <MatchesTableView rows={rows} seasonOf={seasonOf} showSeasonColumn={showSeasonColumn} />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="text-center text-sm text-gray-400 sm:text-base">No matches in this season.</p>
          </div>
        )}
      </div>
      <div className="relative mt-5 flex flex-col space-y-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="text-sm text-gray-400">
          Showing <span className="font-medium text-accent">{rows.length}</span> of{" "}
          <span className="font-medium text-accent">{scope.length}</span> {scope.length !== 1 ? "matches" : "match"}
        </div>
        <CompactPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="self-center sm:self-auto" />
      </div>
    </>
  );
}
