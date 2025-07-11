import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../../../context/auth-context";
import { useCompetition } from "../../../hooks/use-competition";
import LeagueTeamSetupPage from "../../../pages/league-teams-setup-page";
import Loading from "../../ui/loading";
import Background from "../../ui/background";
import Header from "../../ui/header";
import CompetitionPage from "../../../pages/competition-page";

export default function LeagueRouter() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const { user } = useAuth();
  const { competition, isLoading, error } = useCompetition(
    competitionId ?? "",
    user?.id || "",
  );

  const hasCustomTeamNames = (teams: any[]) => {
    return (
      teams?.some(
        (team) =>
          !team.name.match(/^team-\d+$/i) && !team.name.match(/^Team \d+$/i),
      ) ?? false
    );
  };

  if (isLoading) {
    return (
      <div className="relative flex-1 p-3 sm:p-4 md:p-6">
        <Background />
        <Header title="Loading Competition..." hasSidebar={true} />
        <Loading text="Loading competition details..." />
      </div>
    );
  }

  if (error || !competition) {
    return <Navigate to="/competitions" replace />;
  }

  const needsTeamSetup = !hasCustomTeamNames(competition.teams || []);

  if (needsTeamSetup) {
    return <LeagueTeamSetupPage />;
  }

  return <CompetitionPage />;
}
