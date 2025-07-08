import { CompetitionResponse } from "@repo/shared-types";
import MatchList from "../components/features/match-list/match-list";
import FootballField from "../components/features/football-field/football-field";
import StatsTable from "../components/features/stats-table/stats-table";
import { useState } from "react";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

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

  function handleMatchClick(getCurrentMatch: number) {
    setCurrentMatch(getCurrentMatch);
  }
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="relative mb-6 flex flex-col rounded-lg border-2 border-accent bg-panel-bg p-6 text-center shadow-inner">
        <MatchList
          competitionId={competition.id}
          userRole={competition.userRole}
          matches={competition.matches}
          selectedMatch={currentMatch}
          onMatchClick={handleMatchClick}
          refetchMatches={refetch}
        />
        <FootballField match={competition.matches[currentMatch]} />
      </div>
      <div className="relative overflow-hidden rounded-lg border-2 border-accent bg-panel-bg p-5 shadow-lg">
        <StatsTable
          playerStats={competition.player_stats}
          votingEnabled={competition.votingEnabled}
        />
      </div>
    </div>
  );
}
export default DuelCompetitionPage;
