// pages/edit-match-page.tsx
import { useParams } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useEditMatch } from "@/features/add-match-form/hooks/use-edit-match";
import Header from "../components/ui/header";
import Loading from "../components/ui/loading";
import SubmitSpinner from "../components/ui/submit-spinner";
import { MatchFormContent } from "../features/add-match-form/match-form-content";
import { UserResponse } from "@repo/shared-types";
import { useCompetitionInfo } from "@/features/competition/use-competition-info";

export default function EditMatchPage() {
  const { user } = useAuth() as { user: UserResponse };
  const { competitionId, matchId } = useParams<{
    competitionId: string;
    matchId: string;
  }>() as { competitionId: string; matchId: string };

  const { competition, isLoading: isLoadingCompetition } = useCompetitionInfo(
    competitionId,
    user.id,
  );

  const {
    form,
    formSchema,
    isLoading: isLoadingMatch,
    isSubmitting,
    handleSubmit,
  } = useEditMatch(competition?.type, competitionId!, matchId!);

  if (isLoadingCompetition || isLoadingMatch) {
    return (
      <div className="relative flex-1 p-3 sm:p-4 md:p-6">
        <Header title="Edit Match" hasSidebar={true} />
        <Loading text="Loading match data..." />
      </div>
    );
  }

  if (!competition || !formSchema) {
    return (
      <div className="relative flex-1 p-3 sm:p-4 md:p-6">
        <Header title="Edit Match" hasSidebar={true} />
        <div className="p-6 text-center">
          <p>Competition or match not found.</p>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return <SubmitSpinner text="Updating match..." />;
  }

  return (
    <div className="relative flex-1 p-3 sm:p-4 md:p-6">
      <Header title="Edit Match" hasSidebar={true} />
      <MatchFormContent
        form={form}
        formSchema={formSchema}
        competitionType={competition.type}
        isEditing={true}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
