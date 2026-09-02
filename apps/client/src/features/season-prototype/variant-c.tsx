// PROTOTYPE — Variant C: "Context banner". No selector in the header; each
// card carries the selector where it applies, and a banner announces a Past
// season. Standings stay unchanged (always current) and say so. All Matches
// gets a toolbar selector and a permanent Season column.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtoHeader from "./proto-header";
import SeasonSelect from "./season-select";
import LeagueActions from "./league-actions";
import LeagueFixturesView from "./league-fixtures-view";
import LeagueStandingsView from "./league-standings-view";
import LeagueStatsView from "./league-stats-view";
import DuelMatchesView from "./duel-matches-view";
import DuelStatsView from "./duel-stats-view";
import { PastSeasonBanner } from "./season-marks";
import { useSeasonParam } from "./use-season-param";
import { selectionSeason, selectionTitle } from "./fake-seasons";
import { MatchesBody, TAB_TRIGGER_CLASS, TabCard, VariantPageProps, useLeagueTab, useScope } from "./variant-shared";

export const NAME = "Context banner";

function CurrentPill({ current }: { current: number }) {
  return (
    <span className="rounded-md border-2 border-green-500/30 bg-green-900/20 px-2 py-1 text-xs text-green-400">
      Table · Season {current} (current)
    </span>
  );
}

export function League({ model, hasSidebar }: VariantPageProps) {
  const { selection, setSelection, current } = useSeasonParam(model);
  const { activeTab, setTab } = useLeagueTab();
  const { completed, standings, players } = useScope(model, selection);
  const season = selectionSeason(model, selection);
  const past = season?.endedAt != null;
  const title = selectionTitle(model, selection);
  const select = <SeasonSelect model={model} value={selection} onChange={setSelection} compact className="w-full sm:w-[270px]" />;

  return (
    <div className="min-w-0 flex-1 p-6">
      <ProtoHeader title={model.name} hasSidebar={hasSidebar} />
      <div className="relative space-y-4 sm:space-y-6">
        <LeagueActions model={model} />
        {past && season && <PastSeasonBanner season={season} currentNumber={current} onBack={() => setSelection(current)} />}
        <Tabs value={activeTab} onValueChange={setTab} className="w-full">
          <TabsList className="grid h-full w-full grid-cols-3 bg-bg/30 p-1">
            <TabsTrigger value="standings" className={TAB_TRIGGER_CLASS}>Standings</TabsTrigger>
            <TabsTrigger value="fixtures" className={TAB_TRIGGER_CLASS}>Fixtures</TabsTrigger>
            <TabsTrigger value="stats" className={TAB_TRIGGER_CLASS}>Stats</TabsTrigger>
          </TabsList>
          <TabsContent value="standings" className="animate-in fade-in-50">
            <TabCard
              title={`League Table · Season ${current}`}
              right={
                <div className="flex flex-wrap items-center gap-2">
                  {selection !== current && <CurrentPill current={current} />}
                  {select}
                </div>
              }
            >
              <LeagueStandingsView rows={standings} />
            </TabCard>
          </TabsContent>
          <TabsContent value="fixtures" className="animate-in fade-in-50">
            <TabCard title={`Match Results · ${title}`} right={select}>
              <LeagueFixturesView model={model} selection={selection} />
            </TabCard>
          </TabsContent>
          <TabsContent value="stats" className="animate-in fade-in-50">
            <TabCard
              title={`Player Stats · ${title}`}
              right={
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400">{completed} completed matches</span>
                  {select}
                </div>
              }
            >
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
  const season = selectionSeason(model, selection);
  const past = season?.endedAt != null;
  const title = selectionTitle(model, selection);
  const select = <SeasonSelect model={model} value={selection} onChange={setSelection} compact className="w-[240px]" />;

  return (
    <div className="min-w-0 flex-1 p-6">
      <ProtoHeader title={model.name} hasSidebar={hasSidebar} />
      {past && season && (
        <div className="mb-6">
          <PastSeasonBanner season={season} currentNumber={current} onBack={() => setSelection(current)} />
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="relative z-10 flex min-h-[80vh] flex-col gap-2 overflow-visible rounded-lg border-2 border-accent bg-panel-bg p-6 text-center shadow-inner md:min-h-fit">
          <DuelMatchesView model={model} selection={selection} headerRight={select} showAddMatch={!past} />
        </div>
        <div className="relative overflow-hidden rounded-lg border-2 border-accent bg-panel-bg p-5 shadow-lg">
          <DuelStatsView
            playerStats={players}
            totalMatches={scope.length}
            votingEnabled={model.votingEnabled}
            toolbar={select}
            caption={`${title} · ${scope.length} matches. "Min. matches %" is a share of these ${scope.length}.`}
          />
        </div>
      </div>
    </div>
  );
}

export function Matches({ model, hasSidebar }: VariantPageProps) {
  const { selection, setSelection } = useSeasonParam(model);
  return (
    <div className="relative min-w-0 flex-1 p-4 sm:p-5">
      <ProtoHeader title="Matches" hasSidebar={hasSidebar} subtitle={model.name} />
      {model.seasons.length > 1 && (
        <div className="mb-4 flex items-center justify-end gap-2">
          <span className="text-sm font-medium text-accent">Season</span>
          <SeasonSelect model={model} value={selection} onChange={setSelection} compact className="w-[280px]" />
        </div>
      )}
      <MatchesBody model={model} selection={selection} showSeasonColumn />
    </div>
  );
}
