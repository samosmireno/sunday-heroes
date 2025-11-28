import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import LeagueTeamSetupPage from "@/pages/league-teams-setup-page";
import CompetitionPage from "@/pages/competition-page";
import { CompetitionType, UserResponse } from "@repo/shared-types";
import CompetitionAdminPageSkeleton from "@/features/competition-admin/competition-admin-page-skeleton";
import { useCompetitionTeams } from "../competition/use-competition-teams";

export default function LeagueRouter() {
  const { competitionId } = useParams<{ competitionId: string }>() as {
    competitionId: string;
  };
  const { user } = useAuth() as { user: UserResponse };
  const { competition, isLoading, error } = useCompetitionTeams(
    competitionId,
    user.id,
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
    return <CompetitionAdminPageSkeleton />;
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
