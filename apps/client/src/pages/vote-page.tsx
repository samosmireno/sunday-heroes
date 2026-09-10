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
import { VoteNotSubmittedNotice } from "@/features/voting/vote-not-submitted-notice";
import {
  VotingLockNotice,
  VotingThresholdBanner,
} from "@/features/voting/voting-gate";

export default function VotePage() {
  const { matchId } = useParams() as { matchId: string };
  const [searchParams] = useSearchParams();
  const voterId = searchParams.get("voterId") as string;

  const {
    submitVotes,
    isSubmitting,
    success,
    sessionExpired,
    signInToSubmit,
    navigateToDashboard,
  } = useVoteSubmit();
  const { votingStatus, isLoading, error } = useVotingStatus(matchId, voterId);
  const { selectedPlayers, handlePlayerSelect, canSubmit } = usePlayerSelection(
    {
      matchId,
      voterId,
    },
  );

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

  /**
   * The fourth state, and the only one that is not a full-page refusal: a
   * participant the armed Voting gate has shut out reads the ballot rather
   * than being thrown off it. It sits behind the other three deliberately —
   * a blocked voter who already voted on the runway is still Already Voted,
   * and a closed match is still closed.
   */
  const blocked = !votingStatus.eligibility.canVote;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-bg p-6 pb-8">
      <Header title="Player Voting" hasSidebar={true} />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:gap-6">
        <div className="order-1 flex flex-col lg:order-1 lg:flex-[2]">
          {blocked && (
            <VotingThresholdBanner
              eligibility={votingStatus.eligibility}
              seasonNumber={votingStatus.seasonNumber}
            />
          )}
          <div className="rounded-lg border-2 border-accent/70 bg-panel-bg p-5 shadow-lg">
            {/* The heading is an instruction on the live ballot and a label on
                the read-only one: there is nothing to select yet. */}
            <h2 className="mb-4 border-b border-accent/30 pb-2 text-xl font-bold text-accent">
              {blocked ? "Players in This Match" : "Select Your Top 3 Players"}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* `canVoteFor` keeps a voter off their own ballot. Nobody is
                  voting here, so a read-only ballot shows the match as it was
                  played, the viewer among them. */}
              <VotePlayerList
                teamName="Home Team"
                players={votingStatus.players}
                filterFn={(p) => p.isHome && (blocked || p.canVoteFor)}
                selectedPlayers={selectedPlayers}
                onPlayerSelect={handlePlayerSelect}
                disabled={blocked}
              />
              <VotePlayerList
                teamName="Away Team"
                players={votingStatus.players}
                filterFn={(p) => !p.isHome && (blocked || p.canVoteFor)}
                selectedPlayers={selectedPlayers}
                onPlayerSelect={handlePlayerSelect}
                disabled={blocked}
              />
            </div>
          </div>
        </div>
        <div className="order-2 flex flex-col space-y-6 lg:order-2 lg:max-w-md lg:flex-[1]">
          <VotingGuide />
          <VotingDeadline
            votingEndsAt={votingStatus.votingEndsAt}
            blocked={blocked}
          />
          <PlayerSelection
            selectedPlayers={selectedPlayers}
            players={votingStatus.players}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            showSubmitButton={canSubmit}
            /* Both of these take the submit button's place, and only one can
               be true: a blocked voter has no submit button to press, so no
               submit of theirs can have been refused. */
            lockedNotice={
              blocked ? (
                <VotingLockNotice onNavigateToDashboard={navigateToDashboard} />
              ) : sessionExpired ? (
                <VoteNotSubmittedNotice onSignIn={signInToSubmit} />
              ) : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
