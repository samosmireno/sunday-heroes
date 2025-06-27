import "../index.css";
import { useParams } from "react-router-dom";
import { useCompetition } from "../hooks/use-competition";
import ErrorPage from "./error-page";
import Header from "../components/ui/header";
import Loading from "../components/ui/loading";
import { CompetitionProvider } from "../context/competition-context";
import DuelCompetitionPage from "./duel-competition-page";
import { CompetitionType } from "@repo/logger";
import { useAuth } from "../context/auth-context";
import LeagueCompetitionPage from "./league-competition.page";

function CompetitionPage() {
  const { user } = useAuth();
  const { competitionId } = useParams<{ competitionId: string }>();
  const { competition, isLoading, refetch } = useCompetition(
    competitionId ?? "",
    user?.id || "",
  );

  const renderCompetitionPage = () => {
    if (!competition) {
      return <p>No competition data available.</p>;
    }

    switch (competition.type) {
      case CompetitionType.DUEL:
        return (
          <DuelCompetitionPage competition={competition} refetch={refetch} />
        );
      case CompetitionType.LEAGUE:
        return <LeagueCompetitionPage competition={competition} />;
      case CompetitionType.KNOCKOUT:
        return <p>Knockout</p>;
      default:
        return <p>Unknown status.</p>;
    }
  };

  if (isLoading) {
    return <Loading text="Loading competition..." />;
  }

  if (!competition || !competitionId) {
    return <ErrorPage />;
  }

  return (
    <CompetitionProvider value={{ competition, isLoading, refetch }}>
      <div className="flex-1 p-6">
        <Header title={competition.name} hasSidebar={true} />
        {renderCompetitionPage()}
      </div>
    </CompetitionProvider>
  );
}

export default CompetitionPage;
