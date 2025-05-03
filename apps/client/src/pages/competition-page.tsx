import "../index.css";
import MatchList from "../components/features/match-list/match-list";
import StatsTable from "../components/features/stats-table/stats-table";
import FootballField from "../components/features/football-field/football-field";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCompetition } from "../hooks/use-competition";
import ErrorPage from "./error-page";
import Header from "../components/ui/header";
import Loading from "../components/ui/loading";

function CompetitionPage() {
  const [currentMatch, setCurrentMatch] = useState<number>(0);
  const { competitionId } = useParams<{ competitionId: string }>();
  const { competition, isLoading, refetch } = useCompetition(
    competitionId ?? "",
  );

  function handleMatchClick(getCurrentMatch: number) {
    setCurrentMatch(getCurrentMatch);
  }

  if (isLoading) {
    return <Loading text="Loading competition..." />;
  }

  if (!competition || !competitionId) {
    return <ErrorPage />;
  }

  return (
    <>
      <div className="flex-1 p-6">
        <Header title={competition.name} hasSidebar={true} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="relative mb-6 flex flex-col rounded-lg border-2 border-accent bg-panel-bg p-6 text-center shadow-inner">
            <MatchList
              competitionId={competitionId}
              matches={competition.matches}
              selectedMatch={currentMatch}
              onMatchClick={handleMatchClick}
              refetchMatches={refetch}
            />
            <FootballField match={competition.matches[currentMatch]} />
          </div>
          <div className="relative overflow-hidden rounded-lg border-2 border-accent bg-panel-bg p-5 shadow-lg">
            <StatsTable playerStats={competition.player_stats} />
          </div>
        </div>
      </div>
    </>
  );
}

export default CompetitionPage;
