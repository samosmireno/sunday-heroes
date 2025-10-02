import { useParams, useSearchParams } from "react-router-dom";
import Header from "@/components/ui/header";
import { useVotingStatus } from "@/features/voting/hooks/use-voting-status";
import PlayerSelection from "@/features/voting/player-selection";
import VotePlayerList from "@/features/voting/vote-player-list";
import VotePageSkeleton from "@/features/voting/vote-page-skeleton";
import {
  AlreadyVotedState,
  ErrorState,
  NotFoundState,
  SuccessState,
  VotingClosedState,
} from "@/features/voting/vote-states";
import { useVoteSubmit } from "@/features/voting/hooks/use-vote-submit";
import { usePlayerSelection } from "@/features/voting/hooks/use-player-selection";
import { VotingDeadline, VotingGuide } from "@/features/voting/votig-info";

export default function VotePage() {
  const { matchId } = useParams() as { matchId: string };
  const [searchParams] = useSearchParams();
  const voterId = searchParams.get("voterId") as string;

  const { submitVotes, isSubmitting, success, navigateToDashboard } =
    useVoteSubmit();
  const { votingStatus, isLoading, error } = useVotingStatus(matchId, voterId);
  const { selectedPlayers, handlePlayerSelect, canSubmit } =
    usePlayerSelection();

  const handleSubmit = () => {
    submitVotes(matchId, voterId, selectedPlayers);
  };

  if (isLoading) {
    return <VotePageSkeleton />;
  }

  if (error) {
    return (
      <ErrorState error={error} onNavigateToDashboard={navigateToDashboard} />
    );
  }

  if (!votingStatus) {
    return <NotFoundState onNavigateToDashboard={navigateToDashboard} />;
  }

  if (success) {
    return <SuccessState onNavigateToDashboard={navigateToDashboard} />;
  }

  if (votingStatus.hasVoted) {
    return <AlreadyVotedState onNavigateToDashboard={navigateToDashboard} />;
  }

  if (!votingStatus.votingOpen) {
    return <VotingClosedState onNavigateToDashboard={navigateToDashboard} />;
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-bg p-6 pb-8">
      <Header title="Player Voting" hasSidebar={true} />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:gap-6">
        <div className="order-1 flex flex-col lg:order-1 lg:flex-[2]">
          <div className="rounded-lg border-2 border-accent/70 bg-panel-bg p-5 shadow-lg">
            <h2 className="mb-4 border-b border-accent/30 pb-2 text-xl font-bold text-accent">
              Select Your Top 3 Players
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <VotePlayerList
                teamName="Home Team"
                players={votingStatus.players}
                filterFn={(p) => p.isHome && p.canVoteFor}
                selectedPlayers={selectedPlayers}
                onPlayerSelect={handlePlayerSelect}
              />
              <VotePlayerList
                teamName="Away Team"
                players={votingStatus.players}
                filterFn={(p) => !p.isHome && p.canVoteFor}
                selectedPlayers={selectedPlayers}
                onPlayerSelect={handlePlayerSelect}
              />
            </div>
          </div>
        </div>
        <div className="order-2 flex flex-col space-y-6 lg:order-2 lg:max-w-md lg:flex-[1]">
          <VotingGuide />
          <VotingDeadline votingEndsAt={votingStatus.votingEndsAt} />
          <PlayerSelection
            selectedPlayers={selectedPlayers}
            players={votingStatus.players}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            showSubmitButton={canSubmit}
          />
        </div>
      </div>
    </div>
  );
}
