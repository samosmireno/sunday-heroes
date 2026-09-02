// PROTOTYPE — Variant B: "Season strip". A chip strip above the tabs shows
// every season at once, like the round tabs. The Standings tab is hidden
// unless the Current season is selected. All Matches gets simple chips.
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterTabs from "@/components/filter-tabs/filter-tabs";
import ProtoHeader from "./proto-header";
import SeasonStrip from "./season-strip";
import LeagueActions from "./league-actions";
import LeagueFixturesView from "./league-fixtures-view";
import LeagueStandingsView from "./league-standings-view";
import LeagueStatsView from "./league-stats-view";
import DuelMatchesView from "./duel-matches-view";
import DuelStatsView from "./duel-stats-view";
import { useSeasonParam } from "./use-season-param";
import { SeasonSelection, isPastSelection, selectionTitle } from "./fake-seasons";
import { MatchesBody, TAB_TRIGGER_CLASS, TabCard, VariantPageProps, useLeagueTab, useScope } from "./variant-shared";

export const NAME = "Season strip";

export function League({ model, hasSidebar }: VariantPageProps) {
  const { selection, setSelection, current } = useSeasonParam(model);
  const { activeTab, setTab } = useLeagueTab();
  const { completed, standings, players } = useScope(model, selection);
  const standingsHidden = selection !== current;
  const effectiveTab = standingsHidden && activeTab === "standings" ? "fixtures" : activeTab;
  const title = selectionTitle(model, selection);

  useEffect(() => {
    if (standingsHidden && activeTab === "standings") setTab("fixtures");
  }, [standingsHidden, activeTab, setTab]);

  return (
    <div className="min-w-0 flex-1 p-6">
      <ProtoHeader title={model.name} hasSidebar={hasSidebar} />
      <div className="relative space-y-4 sm:space-y-6">
        <LeagueActions model={model} />
        <div>
          <SeasonStrip model={model} value={selection} onChange={setSelection} />
          {standingsHidden && (
            <p className="mt-1.5 pl-1 text-xs text-gray-500">
              Standings are kept for Season {current} (current) only, so the tab is hidden here.
            </p>
          )}
        </div>
        <Tabs value={effectiveTab} onValueChange={setTab} className="w-full">
          <TabsList className={`grid h-full w-full bg-bg/30 p-1 ${standingsHidden ? "grid-cols-2" : "grid-cols-3"}`}>
            {!standingsHidden && <TabsTrigger value="standings" className={TAB_TRIGGER_CLASS}>Standings</TabsTrigger>}
            <TabsTrigger value="fixtures" className={TAB_TRIGGER_CLASS}>Fixtures</TabsTrigger>
            <TabsTrigger value="stats" className={TAB_TRIGGER_CLASS}>Stats</TabsTrigger>
          </TabsList>
          {!standingsHidden && (
            <TabsContent value="standings" className="animate-in fade-in-50">
              <TabCard title="League Table">
                <LeagueStandingsView rows={standings} />
              </TabCard>
            </TabsContent>
          )}
          <TabsContent value="fixtures" className="animate-in fade-in-50">
            <TabCard title="Match Results">
              <LeagueFixturesView model={model} selection={selection} />
            </TabCard>
          </TabsContent>
          <TabsContent value="stats" className="animate-in fade-in-50">
            <TabCard title="Player Stats" right={<p className="text-xs text-gray-400">{title} · {completed} completed matches</p>}>
              <LeagueStatsView players={players} votingEnabled={model.votingEnabled} />
            </TabCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export function Duel({ model, hasSidebar }: VariantPageProps) {
  const { selection, setSelection, current } = useSeasonParam(model);
  const { scope, players } = useScope(model, selection);
  const past = isPastSelection(model, selection);
  const title = selectionTitle(model, selection);

  return (
    <div className="min-w-0 flex-1 p-6">
      <ProtoHeader title={model.name} hasSidebar={hasSidebar} />
      <div className="mb-6">
        <SeasonStrip model={model} value={selection} onChange={setSelection} />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="relative z-10 flex min-h-[80vh] flex-col gap-2 overflow-visible rounded-lg border-2 border-accent bg-panel-bg p-6 text-center shadow-inner md:min-h-fit">
          <DuelMatchesView model={model} selection={selection} showAddMatch={!past} addMatchHint={`New matches go to Season ${current}`} />
        </div>
        <div className="relative overflow-hidden rounded-lg border-2 border-accent bg-panel-bg p-5 shadow-lg">
          <DuelStatsView
            playerStats={players}
            totalMatches={scope.length}
            votingEnabled={model.votingEnabled}
            caption={`${title} · ${scope.length} matches. "Min. matches %" is a share of these ${scope.length}.`}
          />
        </div>
      </div>
    </div>
  );
}

export function Matches({ model, hasSidebar }: VariantPageProps) {
  const { selection, setSelection } = useSeasonParam(model);
  const options: { value: SeasonSelection; label: string }[] = [
    { value: "all", label: "All seasons" },
    ...[...model.seasons].reverse().map((s) => ({
      value: s.number as SeasonSelection,
      label: s.endedAt === null ? `Season ${s.number} (current)` : `Season ${s.number}`,
    })),
  ];
  return (
    <div className="relative min-w-0 flex-1 p-4 sm:p-5">
      <ProtoHeader title="Matches" hasSidebar={hasSidebar} subtitle={model.name} />
      {model.seasons.length > 1 && (
        <FilterTabs<SeasonSelection> options={options} activeFilter={selection} onFilterChange={setSelection} className="mb-4" />
      )}
      <MatchesBody model={model} selection={selection} showSeasonColumn={selection === "all"} />
    </div>
  );
}
