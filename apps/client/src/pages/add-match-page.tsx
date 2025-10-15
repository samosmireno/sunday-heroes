import { useParams } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useCompetition } from "../features/competition/use-competition";
import { useAddMatch } from "@/features/add-match-form/hooks/use-add-match";
import Header from "../components/ui/header";
import Loading from "../components/ui/loading";
import SubmitSpinner from "../components/ui/submit-spinner";
import { MatchFormContent } from "@/features/add-match-form/match-form-content";
import { UserResponse } from "@repo/shared-types";

export default function AddMatchPage() {
  const { user } = useAuth() as { user: UserResponse };
  const { competitionId } = useParams<{ competitionId: string }>() as {
    competitionId: string;
  };

  const { competition, isLoading } = useCompetition(competitionId, user.id);

  const { form, formSchema, isSubmitting, handleSubmit } = useAddMatch(
    competition!,
    competitionId,
  );

  if (isLoading) {
    return (
      <div className="relative flex-1 p-3 sm:p-4 md:p-6">
        <Header title="Add Match" hasSidebar={true} />
        <Loading text="Loading competition data..." />
      </div>
    );
  }

  if (!competition || !formSchema) {
    return (
      <div className="relative flex-1 p-3 sm:p-4 md:p-6">
        <Header title="Add Match" hasSidebar={true} />
        <div className="p-6 text-center">
          <p>Competition not found or invalid data.</p>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return <SubmitSpinner text="Creating match..." />;
  }

  return (
    <div className="relative flex-1 p-3 sm:p-4 md:p-6">
      <Header title="Add Match" hasSidebar={true} />
      <MatchFormContent
        form={form}
        formSchema={formSchema}
        competition={competition}
        isEditing={false}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
