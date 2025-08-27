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
      <div className="relative z-10 flex min-h-[80vh] flex-col gap-2 overflow-visible rounded-lg border-2 border-accent bg-panel-bg p-6 text-center shadow-inner md:min-h-fit">
        <div className="flex-shrink-0">
          <MatchList
            competitionId={competition.id}
            userRole={competition.userRole}
            matches={competition.matches}
            selectedMatch={currentMatch}
            onMatchClick={handleMatchClick}
            refetchMatches={refetch}
          />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <FootballField match={competition.matches[currentMatch]} />
        </div>
      </div>
      <div className="relative overflow-hidden rounded-lg border-2 border-accent bg-panel-bg p-5 shadow-lg">
        <StatsTable
          playerStats={competition.playerStats}
          votingEnabled={competition.votingEnabled}
        />
      </div>
    </div>
  );
}

export default DuelCompetitionPage;
