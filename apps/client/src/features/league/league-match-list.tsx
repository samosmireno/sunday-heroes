import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loading from "@/components/ui/loading";
import { LeagueMatchResponse, Role } from "@repo/shared-types";
import { useLeagueFixtures } from "@/features/league/hooks/use-league-fixtures";
import { useMatchDetails } from "./hooks/use-match-details";
import LeagueMatchCard from "./league-match-card";
import LeagueMatchDetails from "./league-match-details";
import SeasonBeingSetUp from "./season-being-set-up";
import { useCompleteMatch } from "@/features/league/hooks/use-complete-match";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompetitionContext } from "@/context/competition-context";
import {
  GroupedFixtures,
  SeasonFixtures,
  matchesByRound,
  roundNumbers,
} from "./group-fixtures";
import {
  seasonDatesLabel,
  seasonName,
} from "@/features/competition/season-labels";

interface LeagueMatchListProps {
  competitionId: string;
  userRole: Role;
}

/** The cards on view: the active round's for one Season, every season's under All seasons. */
function visibleMatches(
  fixtures: GroupedFixtures,
  activeRound: number | null,
): LeagueMatchResponse[] {
  if (fixtures.view === "seasons") {
    return fixtures.seasons.flatMap((group) => matchesByRound(group.rounds));
  }
  return activeRound === null ? [] : (fixtures.rounds[activeRound] ?? []);
}

/** One Season's cards under All seasons: a header, then the matches in round order with their R-number. */
function SeasonGroup({
  group,
  dates,
  selectedId,
  onSelect,
}: {
  group: SeasonFixtures;
  /** The Season's date range, once the season list is known. */
  dates: string | undefined;
  selectedId: string | undefined;
  onSelect: (match: LeagueMatchResponse) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between border-b border-accent/20 pb-1">
        <span className="text-sm font-semibold text-accent">
          {seasonName(group.season.number)}
        </span>
        {dates && <span className="text-[11px] text-gray-500">{dates}</span>}
      </div>
      <div className="space-y-2">
        {matchesByRound(group.rounds).map((match) => (
          <LeagueMatchCard
            key={match.id}
            match={match}
            isSelected={selectedId === match.id}
            onSelect={onSelect}
            showRound
          />
        ))}
      </div>
    </div>
  );
}

export default function LeagueMatchList({
  competitionId,
  userRole,
}: LeagueMatchListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { season, seasons } = useCompetitionContext();

  const { leagueFixtures, isFixturesLoading } = useLeagueFixtures(
    competitionId,
    season,
  );

  const rounds =
    leagueFixtures?.view === "rounds"
      ? roundNumbers(leagueFixtures.rounds)
      : [];
  const requestedRound = Number(searchParams.get("round"));
  const activeRound = rounds.includes(requestedRound)
    ? requestedRound
    : (rounds[0] ?? null);

  // The card the viewer picked while it is on view, else the first on view.
  // A season switch drops the URL round and, with it, a selection from the
  // season before, so the details panel never shows another season's match.
  const matches = leagueFixtures
    ? visibleMatches(leagueFixtures, activeRound)
    : [];
  const selectedMatch =
    matches.find((match) => match.id === selectedId) ?? matches[0] ?? null;

  const { match, isMatchLoading, isMatchCompleted, isMatchUnfinished } =
    useMatchDetails(selectedMatch?.id || "");
  const completeMatchMutation = useCompleteMatch(competitionId);

  const selectMatch = (match: LeagueMatchResponse) => setSelectedId(match.id);

  const handleRoundChange = (roundStr: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("round", roundStr);
    setSearchParams(newSearchParams);
    setSelectedId(null);
  };

  const handleEditMatch = () => {
    if (selectedMatch) {
      navigate(`/edit-match/${competitionId}/${selectedMatch.id}`);
    }
  };

  const handleCompleteMatch = async () => {
    if (selectedMatch) {
      await completeMatchMutation.mutateAsync(selectedMatch.id);
    }
  };

  if (isFixturesLoading || isMatchLoading) {
    return <Loading text="Loading matches..." />;
  }

  if (!leagueFixtures || matches.length === 0) {
    return <SeasonBeingSetUp />;
  }

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        {leagueFixtures.view === "seasons" ? (
          <div className="max-h-screen space-y-4 overflow-y-auto pr-1">
            {leagueFixtures.seasons.map((group) => {
              const season = seasons.find(
                (s) => s.number === group.season.number,
              );
              return (
                <SeasonGroup
                  key={group.season.number}
                  group={group}
                  dates={season && seasonDatesLabel(season)}
                  selectedId={selectedMatch?.id}
                  onSelect={selectMatch}
                />
              );
            })}
          </div>
        ) : (
          <Tabs
            value={activeRound?.toString() || ""}
            onValueChange={handleRoundChange}
            className="w-full"
          >
            <div className="h-full w-full overflow-x-auto">
              <TabsList className="flex h-full w-max min-w-full gap-1 bg-bg/30 p-2 pb-4">
                {rounds.map((round) => (
                  <TabsTrigger
                    key={round}
                    value={round.toString()}
                    className="flex-shrink-0 whitespace-nowrap text-sm data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
                  >
                    Round {round}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {rounds.map((round) => (
              <TabsContent key={round} value={round.toString()}>
                <div className="max-h-screen space-y-2 overflow-y-auto">
                  {leagueFixtures.rounds[round]?.map((match) => (
                    <LeagueMatchCard
                      key={match.id}
                      match={match}
                      isSelected={selectedMatch?.id === match.id}
                      onSelect={selectMatch}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      <div className="lg:col-span-3">
        <div className="flex h-full min-h-[400px] flex-col rounded-lg border-2 border-accent/30 bg-panel-bg">
          {selectedMatch ? (
            <LeagueMatchDetails
              role={userRole}
              selectedMatch={selectedMatch}
              match={match || null}
              isMatchCompleted={isMatchCompleted || false}
              isMatchUnfinished={isMatchUnfinished}
              onEditMatch={handleEditMatch}
              onCompleteMatch={handleCompleteMatch}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              Select a match to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
