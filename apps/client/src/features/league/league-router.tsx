import { useParams, Navigate } from "react-router-dom";
import LeagueTeamSetupPage from "@/pages/league-teams-setup-page";
import CompetitionPage from "@/pages/competition-page";
import CompetitionAdminPageSkeleton from "@/features/competition-admin/competition-admin-page-skeleton";
import { useAuth } from "@/context/auth-context";
import { useCompetitionInfo } from "../competition/use-competition-info";
import { useCompetitionTeams } from "../competition/use-competition-teams";
import { needsTeamsSetup } from "./needs-teams-setup";

/**
 * Serves the public `/competition/:competitionId` and the protected
 * `/league-setup/:competitionId`: Teams setup for an admin or moderator while
 * the League needs it (see `needsTeamsSetup`), the League page for everyone
 * else. The role comes from the info read, so an anonymous visitor never sees
 * the setup form.
 */
export default function LeagueRouter() {
  const { competitionId } = useParams<{ competitionId: string }>() as {
    competitionId: string;
  };
  const { user, isLoading: isAuthLoading } = useAuth();
  const info = useCompetitionInfo(competitionId, user?.id);
  const teams = useCompetitionTeams(competitionId);

  if (isAuthLoading || info.isLoading || teams.isLoading) {
    return <CompetitionAdminPageSkeleton />;
  }

  if (info.error || !info.competition || teams.error || !teams.competition) {
    return <Navigate to="/competitions" replace />;
  }

  const showTeamsSetup = needsTeamsSetup({
    type: info.competition.type,
    userRole: info.competition.userRole,
    seasons: info.competition.seasons,
    teams: teams.competition.teams ?? [],
  });

  if (showTeamsSetup) {
    return <LeagueTeamSetupPage />;
  }

  return <CompetitionPage />;
}
