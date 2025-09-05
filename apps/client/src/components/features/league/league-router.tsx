import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../../../context/auth-context";
import { useCompetition } from "../../../hooks/use-competition";
import LeagueTeamSetupPage from "../../../pages/league-teams-setup-page";
import Loading from "../../ui/loading";
import Background from "../../ui/background";
import CompetitionPage from "../../../pages/competition-page";
import { CompetitionType } from "@repo/shared-types";

export default function LeagueRouter() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const { user } = useAuth();
  const { competition, isLoading, error } = useCompetition(
    competitionId ?? "",
    user?.id || "",
  );

  const hasCustomTeamNames = (
    teams: {
      id: string;
      name: string;
    }[],
  ) => {
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
        <Loading text="Loading competition details..." />
      </div>
    );
  }

  if (error || !competition) {
    return <Navigate to="/competitions" replace />;
  }

  const needsTeamSetup = !hasCustomTeamNames(competition.teams || []);

  if (needsTeamSetup && competition.type !== CompetitionType.DUEL) {
    return <LeagueTeamSetupPage />;
  }

  return <CompetitionPage />;
}
