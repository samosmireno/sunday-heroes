import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/ui/header";
import { usePendingVotes } from "@/features/pending-votes/use-pending-votes";
import { useAuth } from "@/context/auth-context";
import PendingVotesPageSkeleton from "@/features/pending-votes/pending-votes-page-skeleton";
import {
  ErrorState,
  NotFoundState,
} from "@/features/pending-votes/error-state";
import { PendingVotesTable } from "@/features/pending-votes/pending-votes-table";
import { UserResponse } from "@repo/shared-types";

export default function AdminPendingVotes() {
  const { matchId } = useParams() as { matchId: string };
  const { user } = useAuth() as { user: UserResponse };
  const navigate = useNavigate();

  const { votingData, isLoading, error } = usePendingVotes(matchId, user.id);

  const handleVoteClick = (matchId: string, playerId: string) => {
    navigate(`/vote/${matchId}?voterId=${playerId}`);
  };

  if (isLoading) {
    return <PendingVotesPageSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!votingData) {
    return <NotFoundState />;
  }

  return (
    <div className="min-h-screen flex-1 bg-bg p-6">
      <Header
        title={`Pending Votes for ${votingData.competitionName}`}
        hasSidebar={true}
      />
      <div className="relative rounded-lg border-2 border-accent bg-panel-bg p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-accent">
          Pending Player Votes
        </h2>
        <PendingVotesTable
          votingData={votingData}
          onVoteClick={handleVoteClick}
        />
      </div>
    </div>
  );
}
