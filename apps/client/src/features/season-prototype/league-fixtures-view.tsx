// PROTOTYPE — throwaway. Season-aware Fixtures tab: round tabs for one
// season, a grouped list for All seasons, read-only for a Past season.
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Edit, Video } from "lucide-react";
import { Role } from "@repo/shared-types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FootballField from "@/features/football-field/football-field";
import {
  ProtoMatch,
  ProtoModel,
  ProtoSeason,
  SeasonSelection,
  currentSeason,
  groupByRound,
  matchesFor,
  seasonByNumber,
  seasonDates,
  toMatchResponse,
} from "./fake-seasons";
import { ClosedSeasonBadge, NotCompletedTag } from "./season-marks";

interface LeagueFixturesViewProps {
  model: ProtoModel;
  selection: SeasonSelection;
}

const formatCardDate = (date: string | null) =>
  date
    ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "TBD";

function FixtureCard({
  match,
  isSelected,
  onSelect,
  inPastSeason,
  showRound,
}: {
  match: ProtoMatch;
  isSelected: boolean;
  onSelect: (m: ProtoMatch) => void;
  inPastSeason: boolean;
  showRound: boolean;
}) {
  const abandoned = inPastSeason && !match.isCompleted;
  const blank = abandoned && match.homeScore === 0 && match.awayScore === 0;
  const score = (n: number) => (blank ? "–" : n);
  return (
    <div
      onClick={() => onSelect(match)}
      className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:border-accent/60 ${
        isSelected ? "border-accent bg-accent/10" : "border-accent/20 bg-panel-bg hover:bg-accent/5"
      } ${abandoned ? "opacity-70" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {showRound && <span className="mr-2 text-accent/80">R{match.round}</span>}
          {formatCardDate(match.date)}
        </span>
        {abandoned && <NotCompletedTag />}
      </div>
      <div className="space-y-1">
        {[
          [match.homeTeam, match.homeScore],
          [match.awayTeam, match.awayScore],
        ].map(([team, s]) => (
          <div key={String(team)} className="flex items-center justify-between">
            <span className="truncate text-sm font-medium text-gray-300">{team}</span>
            <span className={`text-lg font-bold ${abandoned ? "text-gray-500" : "text-accent"}`}>
              {score(Number(s))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FixtureDetails({
  match,
  season,
  role,
}: {
  match: ProtoMatch;
  season: ProtoSeason;
  role: Role;
}) {
  const closed = season.endedAt !== null;
  const abandoned = closed && !match.isCompleted;
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-accent/30 p-3 sm:p-4 md:p-5 lg:p-6">
        <div className="text-center">
          <h3 className="mb-2 text-base font-bold text-accent sm:mb-3 sm:text-lg lg:text-xl">
            {match.homeTeam} <span className="mx-2 text-gray-400">vs</span> {match.awayTeam}
          </h3>
          <div className={`mb-2 text-xl font-bold sm:mb-3 sm:text-2xl lg:text-3xl ${abandoned ? "text-gray-500" : "text-white"}`}>
            {match.homeScore} - {match.awayScore}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400 sm:text-sm">
            <span>Round {match.round}</span>
            <span>•</span>
            <span>
              {match.date
                ? new Date(match.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
                : "Date TBD"}
            </span>
            {abandoned && (
              <>
                <span>•</span>
                <NotCompletedTag />
              </>
            )}
          </div>
        </div>
      </div>

      {role !== Role.PLAYER && (
        <div className="border-b border-accent/10 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            {match.videoUrl && (
              <Button size="sm" className="w-full border-2 border-accent/40 bg-bg/30 text-gray-300 hover:bg-accent/10 sm:w-auto">
                <Video className="mr-2 h-4 w-4" />
                <span className="text-xs xl:text-sm">Watch</span>
              </Button>
            )}
            {closed ? (
              <ClosedSeasonBadge season={season} />
            ) : (
              <>
                <Button size="sm" title="Prototype: no action" className="w-full border-2 border-accent/40 bg-bg/30 text-gray-300 hover:bg-accent/10 sm:w-auto">
                  <Edit className="mr-2 h-4 w-4" />
                  <span className="text-xs xl:text-sm">Edit</span>
                </Button>
                {match.isCompleted ? (
                  <div className="rounded-md border-2 border-green-500/30 bg-green-900/20 px-3 py-1.5 text-center text-xs text-green-400 lg:py-1 lg:text-sm">
                    ✓ Match completed
                  </div>
                ) : (
                  <Button size="sm" title="Prototype: no action" className="w-full border-2 border-accent/40 bg-bg/30 text-gray-300 hover:bg-accent/10 sm:w-auto">
                    <Check className="mr-2 h-4 w-4" />
                    <span className="text-xs xl:text-sm">Mark as Completed</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden p-3 sm:p-4 md:p-5 lg:p-6">
        <FootballField match={toMatchResponse(match)} hoverable={true} />
      </div>
    </div>
  );
}

export default function LeagueFixturesView({ model, selection }: LeagueFixturesViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const matches = useMemo(() => matchesFor(model, selection), [model, selection]);
  const current = currentSeason(model);
  const grouped = selection === "all";

  const rounds = useMemo(() => (grouped ? {} : groupByRound(matches)), [grouped, matches]);
  const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);
  const activeRound = searchParams.get("round") ? Number(searchParams.get("round")) : roundNumbers[0] ?? null;

  const selected = matches.find((m) => m.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) return;
    const first = grouped ? matches[0] : activeRound ? rounds[activeRound]?.[0] : undefined;
    if (first) setSelectedId(first.id);
  }, [selected, grouped, matches, activeRound, rounds]);

  const handleRoundChange = (roundStr: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("round", roundStr);
    setSearchParams(params);
    const first = rounds[Number(roundStr)]?.[0];
    if (first) setSelectedId(first.id);
  };

  if (matches.length === 0) {
    const isCurrentEmpty = selection === current.number;
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg bg-bg/20 p-6 text-center">
        <h3 className="mb-1 text-base font-medium text-gray-200">
          {isCurrentEmpty ? `Season ${current.number} is being set up` : "No matches found."}
        </h3>
        {isCurrentEmpty && (
          <p className="max-w-sm text-sm text-gray-400">
            Fixtures appear once the admin saves the teams for this season. Past seasons are still viewable above.
          </p>
        )}
      </div>
    );
  }

  const seasonOf = (m: ProtoMatch) => seasonByNumber(model, m.seasonNumber)!;

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        {grouped ? (
          <div className="max-h-screen space-y-4 overflow-y-auto pr-1">
            {[...model.seasons].reverse().map((s) => {
              const list = matches.filter((m) => m.seasonNumber === s.number);
              if (list.length === 0) return null;
              return (
                <div key={s.number}>
                  <div className="mb-2 flex items-center justify-between border-b border-accent/20 pb-1">
                    <span className="text-sm font-semibold text-accent">Season {s.number}</span>
                    <span className="text-[11px] text-gray-500">
                      {seasonDates(s)} · {list.length} matches
                    </span>
                  </div>
                  <div className="space-y-2">
                    {list.map((m) => (
                      <FixtureCard key={m.id} match={m} isSelected={selectedId === m.id} onSelect={(x) => setSelectedId(x.id)} inPastSeason={s.endedAt !== null} showRound />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Tabs value={activeRound?.toString() ?? ""} onValueChange={handleRoundChange} className="w-full">
            <div className="h-full w-full overflow-x-auto">
              <TabsList className="flex h-full w-max min-w-full gap-1 bg-bg/30 p-2 pb-4">
                {roundNumbers.map((r) => (
                  <TabsTrigger key={r} value={r.toString()} className="flex-shrink-0 whitespace-nowrap text-sm data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                    Round {r}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {roundNumbers.map((r) => (
              <TabsContent key={r} value={r.toString()}>
                <div className="max-h-screen space-y-2 overflow-y-auto">
                  {rounds[r].map((m) => (
                    <FixtureCard key={m.id} match={m} isSelected={selectedId === m.id} onSelect={(x) => setSelectedId(x.id)} inPastSeason={seasonOf(m).endedAt !== null} showRound={false} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      <div className="lg:col-span-3">
        <div className="flex h-full min-h-[400px] flex-col rounded-lg border-2 border-accent/30 bg-panel-bg">
          {selected ? (
            <FixtureDetails match={selected} season={seasonOf(selected)} role={model.userRole} />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">Select a match to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
