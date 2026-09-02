import { useParams } from "react-router-dom";
import { useCompetition } from "../features/competition/use-competition";
import ErrorPage from "./error-page";
import Header from "@/components/ui/header";
import { CompetitionProvider } from "../context/competition-context";
import DuelCompetitionPage from "./duel-competition-page";
import { CompetitionType } from "@repo/shared-types";
import { useAuth } from "@/context/auth-context";
import LeagueCompetitionPage from "./league-competition/league-competition-page";
import CompetitionAdminPageSkeleton from "@/features/competition-admin/competition-admin-page-skeleton";
// PROTOTYPE — throwaway: season selector variants replace the page in dev.
import SeasonPrototypePage from "@/features/season-prototype/season-prototype-page";
import { PROTOTYPE_ENABLED } from "@/components/prototype/prototype-switcher";

function CompetitionPage() {
  const { user } = useAuth();
  const { competitionId } = useParams<{ competitionId: string }>() as {
    competitionId: string;
  };
  const { competition, isLoading, refetch } = useCompetition(
    competitionId,
    user?.id,
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
    return <CompetitionAdminPageSkeleton />;
  }

  if (!competition || !competitionId) {
    return <ErrorPage />;
  }

  if (PROTOTYPE_ENABLED) {
    return (
      <CompetitionProvider value={{ competition, isLoading, refetch }}>
        <SeasonPrototypePage competition={competition} hasSidebar={!!user} />
      </CompetitionProvider>
    );
  }

  return (
    <CompetitionProvider value={{ competition, isLoading, refetch }}>
      <div className="flex-1 p-6">
        <Header title={competition.name} hasSidebar={!!user} />
        {renderCompetitionPage()}
      </div>
    </CompetitionProvider>
  );
}

export default CompetitionPage;
