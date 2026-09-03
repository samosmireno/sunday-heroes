import { CompetitionResponse } from "@repo/shared-types";
import MatchList from "../features/duel/match-list";
import FootballField from "../features/football-field/football-field";
import StatsTable from "../features/stats-table/stats-table";
import { useState } from "react";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { useCompetitionContext } from "@/context/competition-context";
import { duelStatsCaption } from "@/features/competition/season-labels";

interface DuelCompetitionPageProps {
  competition: CompetitionResponse;
  refetch: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<CompetitionResponse, Error>>;
}

function DuelCompetitionPage({
  competition,
  refetch,
}: DuelCompetitionPageProps) {
  const [currentMatch, setCurrentMatch] = useState<number>(0);
  const { selection, selectedSeason, seasons, isAll } = useCompetitionContext();

  function handleMatchClick(getCurrentMatch: number) {
    setCurrentMatch(getCurrentMatch);
  }

  // The percentage filter's denominator: the selected season's match count
  // from the season list (summed under All seasons), the read's own matches
  // until the list is there.
  const seasonMatchCount = isAll
    ? seasons.length > 0
      ? seasons.reduce((count, season) => count + season.matchCount, 0)
      : undefined
    : selectedSeason?.matchCount;
  const totalMatches = seasonMatchCount ?? competition.matches.length;
  const caption =
    selection !== undefined
      ? duelStatsCaption(selection, totalMatches)
      : undefined;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="relative z-10 flex min-h-[80vh] flex-col gap-2 overflow-visible rounded-lg border-2 border-accent bg-panel-bg p-6 text-center shadow-inner md:min-h-fit">
        <div className="flex-shrink-0">
          <MatchList
            userRole={competition.userRole}
            matches={competition.matches}
            selectedMatch={currentMatch}
            onMatchClick={handleMatchClick}
            refetchMatches={refetch}
          />
        </div>
        <div className="flex items-center justify-center">
          <FootballField
            match={competition.matches[currentMatch]}
            hoverable={true}
          />
        </div>
      </div>
      <div className="relative overflow-hidden rounded-lg border-2 border-accent bg-panel-bg p-5 shadow-lg">
        <StatsTable
          playerStats={competition.playerStats}
          votingEnabled={competition.votingEnabled}
          totalMatches={totalMatches}
          caption={caption}
        />
      </div>
    </div>
  );
}

export default DuelCompetitionPage;
