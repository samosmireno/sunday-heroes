// PROTOTYPE — Variant A: "Header dropdown". One Select in the page header,
// next to the competition name. Standings on a Past season is replaced by
// a note; on All seasons the current table shows with a caption.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtoHeader from "./proto-header";
import SeasonSelect from "./season-select";
import LeagueActions from "./league-actions";
import LeagueFixturesView from "./league-fixtures-view";
import LeagueStandingsView from "./league-standings-view";
import LeagueStatsView from "./league-stats-view";
import DuelMatchesView from "./duel-matches-view";
import DuelStatsView from "./duel-stats-view";
import { StandingsNote } from "./season-marks";
import { useSeasonParam } from "./use-season-param";
import { isPastSelection, seasonDates, selectionSeason, selectionTitle } from "./fake-seasons";
import { MatchesBody, TAB_TRIGGER_CLASS, TabCard, VariantPageProps, useLeagueTab, useScope } from "./variant-shared";

export const NAME = "Header dropdown";

function Caption({ text }: { text: string }) {
  return <p className="text-xs text-gray-400">{text}</p>;
}

export function League({ model, hasSidebar }: VariantPageProps) {
  const { selection, setSelection, current } = useSeasonParam(model);
  const { activeTab, setTab } = useLeagueTab();
  const { completed, standings, players } = useScope(model, selection);
  const past = isPastSelection(model, selection);
  const season = selectionSeason(model, selection);
  const scopeText = season ? `${selectionTitle(model, selection)} · ${seasonDates(season)}` : `All ${model.seasons.length} seasons`;

  return (
    <div className="min-w-0 flex-1 p-6">
      <ProtoHeader
        title={model.name}
        hasSidebar={hasSidebar}
        right={<SeasonSelect model={model} value={selection} onChange={setSelection} className="w-full sm:w-[300px]" />}
      />
      <div className="relative space-y-4 sm:space-y-6">
        <LeagueActions model={model} />
        <Tabs value={activeTab} onValueChange={setTab} className="w-full">
          <TabsList className="grid h-full w-full grid-cols-3 bg-bg/30 p-1">
            <TabsTrigger value="standings" className={TAB_TRIGGER_CLASS}>Standings</TabsTrigger>
            <TabsTrigger value="fixtures" className={TAB_TRIGGER_CLASS}>Fixtures</TabsTrigger>
            <TabsTrigger value="stats" className={TAB_TRIGGER_CLASS}>Stats</TabsTrigger>
          </TabsList>
          <TabsContent value="standings" className="animate-in fade-in-50">
            <TabCard title="League Table">
              {past ? (
                <StandingsNote currentNumber={current} onViewCurrent={() => setSelection(current)} />
              ) : (
                <>
                  {selection === "all" && <StandingsNote variant="caption" currentNumber={current} onViewCurrent={() => setSelection(current)} />}
                  <LeagueStandingsView rows={standings} />
                </>
              )}
            </TabCard>
          </TabsContent>
          <TabsContent value="fixtures" className="animate-in fade-in-50">
            <TabCard title="Match Results" right={<Caption text={scopeText} />}>
              <LeagueFixturesView model={model} selection={selection} />
            </TabCard>
          </TabsContent>
          <TabsContent value="stats" className="animate-in fade-in-50">
            <TabCard title="Player Stats" right={<Caption text={`${scopeText} · ${completed} completed matches`} />}>
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
      <ProtoHeader
        title={model.name}
        hasSidebar={hasSidebar}
        right={<SeasonSelect model={model} value={selection} onChange={setSelection} className="w-full sm:w-[300px]" />}
      />
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
  return (
    <div className="relative min-w-0 flex-1 p-4 sm:p-5">
      <ProtoHeader
        title="Matches"
        hasSidebar={hasSidebar}
        subtitle={model.name}
        right={<SeasonSelect model={model} value={selection} onChange={setSelection} className="w-full sm:w-[300px]" />}
      />
      <MatchesBody model={model} selection={selection} showSeasonColumn={selection === "all"} />
    </div>
  );
}
