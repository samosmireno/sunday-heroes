import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../../../context/auth-context";
import { useCompetition } from "../../../hooks/use-competition";
import LeagueTeamSetupPage from "../../../pages/league-teams-setup-page";
import CompetitionPage from "../../../pages/competition-page";
import { CompetitionType } from "@repo/shared-types";
import CompetitionAdminPageSkeleton from "../../../pages/competition-admin/competition-admin-page-skeleton";

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
