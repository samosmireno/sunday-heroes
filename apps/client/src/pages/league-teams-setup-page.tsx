import { useParams } from "react-router-dom";
import Header from "@/components/ui/header";
import { useAuth } from "@/context/auth-context";
import CompetitionListSkeleton from "../features/competition-list/competition-list-skeleton";
import { TeamNamesFormData } from "@/features/league-teams-setup/schemas";
import { useUpdateTeamNames } from "@/features/league-teams-setup/use-update-team-names";
import { TeamSetupError } from "@/features/league-teams-setup/team-setup-error";
import { TeamNamesForm } from "@/features/league-teams-setup/team-names-form";
import SubmitSpinner from "@/components/ui/submit-spinner";
import { UserResponse } from "@repo/shared-types";
import { useCompetitionTeams } from "@/features/competition/use-competition-teams";

export default function LeagueTeamSetupPage() {
  const { competitionId } = useParams() as { competitionId: string };
  const { user } = useAuth() as { user: UserResponse };
  const { competition, isLoading } = useCompetitionTeams(
    competitionId,
    user.id,
  );
  const updateTeamNames = useUpdateTeamNames();

  const handleSubmit = (data: TeamNamesFormData) => {
    if (!competitionId || !competition?.teams) return;

    const teamUpdates = competition.teams.map((team, index) => ({
      id: team.id,
      name: data[`team${index}`] || team.name,
    }));

    updateTeamNames.mutate({ competitionId, teamUpdates });
  };

  if (isLoading) {
    return <CompetitionListSkeleton />;
  }

  if (!competition) {
    return <TeamSetupError />;
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
      {updateTeamNames.isPending && (
        <SubmitSpinner text="Setting up teams..." />
      )}
      <Header title="League Teams Setup" hasSidebar={true} />
      <div className="relative grid grid-cols-1 gap-4 sm:gap-6">
        <TeamNamesForm
          competition={competition}
          onSubmit={handleSubmit}
          isSubmitting={updateTeamNames.isPending}
        />
      </div>
    </div>
  );
}
