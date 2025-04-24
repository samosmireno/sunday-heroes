import "../index.css";
import MatchList from "../components/features/match-list/match-list";
import StatsTable from "../components/features/stats-table/stats-table";
import FootballField from "../components/features/football-field/football-field";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCompetition } from "../hooks/use-competition";
import ErrorPage from "./error-page";
import { SidebarTrigger } from "../components/ui/sidebar";

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
    return <div>Loading...</div>;
  }

  if (!competition || !competitionId) {
    return <ErrorPage />;
  }

  return (
    <>
      <div className="flex-1 p-6">
        <header className="relative mb-8 rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg">
          <div className="flex items-center">
            <SidebarTrigger className="mr-3" />
            <h1
              className="text-3xl font-bold uppercase tracking-wider text-accent"
              style={{ textShadow: "2px 2px 0 #000" }}
            >
              {competition.name}
            </h1>
          </div>
        </header>

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
