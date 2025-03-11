import "../index.css";
import MatchList from "../components/features/match-list/match-list";
import StatsTable from "../components/features/stats-table/stats-table";
import FootballField from "../components/features/football-field/football-field";
import { useState } from "react";
import { useAuth } from "../context/auth-context";
import { useParams } from "react-router-dom";
import { useCompetition } from "../hooks/use-competition";
import ErrorPage from "./error-page";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/features/sidebar/app-sidebar";

function CompetitionPage() {
  const [currentMatch, setCurrentMatch] = useState<number>(0);
  const { isLoggedIn, login, logout } = useAuth();
  const { competitionId } = useParams<{ competitionId: string }>();
  const { competition, isLoading, refetch } = useCompetition(
    competitionId ?? "",
  );

  console.log("comp", competitionId);

  function handleMatchClick(getCurrentMatch: number) {
    setCurrentMatch(getCurrentMatch);
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!competition) {
    return <ErrorPage />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-gray-300 to-white">
        <SidebarTrigger />
        <div className="flex flex-row items-center justify-between px-3 py-5">
          <h1 className="flex-grow text-center font-oswald text-3xl font-semibold">
            {competition.name}
          </h1>
          <button
            className="cursor-pointer border-none bg-transparent px-2 py-5 font-exo text-base decoration-0 hover:underline"
            onClick={isLoggedIn ? logout : login}
          >
            {isLoggedIn ? "Logout" : "Login"}
          </button>
        </div>
        <div className="flex flex-col justify-around xl:flex-row">
          <div className="flex w-full max-w-2xl flex-col p-4 md:mx-auto">
            <MatchList
              matches={competition.matches}
              selectedMatch={currentMatch}
              onMatchClick={handleMatchClick}
              isLoggedIn={isLoggedIn}
              refetchMatches={refetch}
            />
            <FootballField match={competition.matches[currentMatch]} />
          </div>
          <div className="m-4 mx-auto flex max-w-xl flex-col p-4">
            <StatsTable playerStats={competition.player_stats} />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default CompetitionPage;
