import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import { config } from "../config/config";
import { CheckCircle2, Info } from "lucide-react";
import Background from "../components/ui/background";
import Header from "../components/ui/header";
import Loading from "../components/ui/loading";
import { useVotingStatus } from "../hooks/use-voting-status";
import { GuideBox } from "../components/ui/guide-box";
import { InfoBox } from "../components/ui/info-box";
import PlayerSelection from "../components/features/voting/player-selection";
import VotePlayerList from "../components/features/voting/vote-player-list";

interface SelectedPlayer {
  id: string;
  rank: number;
}

function findFirstRankMissing(arr: number[]) {
  const allowedValues = [3, 2, 1];
  for (let val of allowedValues) {
    if (!arr.includes(val)) {
      return val;
    }
  }
  return -1;
}

export default function VotePage() {
  const { matchId } = useParams();
  const [searchParams] = useSearchParams();
  const voterId = searchParams.get("voterId");
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!matchId || !voterId) return;

  const { votingStatus, isLoading, error } = useVotingStatus(matchId, voterId);

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayers((prev) => {
      const playerNames = prev.map((p) => p.id);
      if (playerNames.includes(playerId)) {
        return prev.filter((p) => p.id !== playerId);
      }

      if (prev.length >= 3) {
        return [...prev];
      }

      const rank = findFirstRankMissing(prev.map((p) => p.rank));
      if (rank === -1) return [...prev];

      return [...prev, { id: playerId, rank: rank }];
    });
  };

  const handleSubmit = async () => {
    if (!matchId || !voterId || selectedPlayers.length !== 3) return;

    setIsSubmitting(true);
    try {
      const votes = selectedPlayers.map((p) => ({
        playerId: p.id,
        points: p.rank,
      }));

      await axiosInstance.post(`${config.server}/api/votes`, {
        matchId,
        voterId,
        votes,
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading text="Loading match details..." />;
  }

  if (error) {
    return (
      <div className="h-screen flex-1 bg-bg p-6">
        <Header title="Voting Error" hasSidebar={true} />
        <div className="srounded-lg relative border-2 border-red-500 bg-panel-bg p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-red-500">Error</h2>
          <p className="text-gray-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!votingStatus) {
    return (
      <div className="h-screen flex-1 bg-bg p-6">
        <Header title="Match not found" hasSidebar={true} />

        <div className="relative rounded-lg border-2 border-accent/70 bg-panel-bg p-6 text-center shadow-lg">
          <p className="text-gray-200">
            The requested match could not be found or you don't have permission
            to vote.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="h-screen flex-1 bg-bg p-6">
        <Header title="Vote Successful" hasSidebar={true} />

        <div className="relative rounded-lg border-2 border-green-500 bg-panel-bg p-6 shadow-lg">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-green-500">
              Votes Submitted Successfully!
            </h2>
            <p className="max-w-lg text-gray-300">
              Thank you for voting for the best players in this match. Your
              votes have been recorded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (votingStatus.hasVoted) {
    return (
      <div className="h-screen flex-1 bg-bg p-6">
        <Background />
        <Header title="Already Voted" hasSidebar={true} />

        <div className="relative rounded-lg border-2 border-accent/70 bg-panel-bg p-6 text-center shadow-lg">
          <p className="text-gray-200">
            You have already submitted your votes for this match. Thank you for
            participating!
          </p>
        </div>
      </div>
    );
  }

  if (!votingStatus.votingOpen) {
    return (
      <div className="h-screen flex-1 bg-bg p-6">
        <Background />
        <Header title="Voting Closed" hasSidebar={true} />

        <div className="relative rounded-lg border-2 border-accent/70 bg-panel-bg p-6 text-center shadow-lg">
          <p className="text-gray-200">
            Voting is no longer available for this match. The voting period has
            ended.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-1 flex-col bg-bg p-6">
      <Background />
      <Header title="Player Voting" hasSidebar={true} />
      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col space-y-6 lg:col-span-1">
          <GuideBox title="How Voting Works">
            <div className="space-y-4 text-gray-300">
              <p className="flex items-start">
                <span className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                  1
                </span>
                Select 3 players you think performed best in the match
              </p>
              <p className="flex items-start">
                <span className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                  2
                </span>
                Your first pick gets 3 points, second gets 2 points, third gets
                1 point
              </p>
              <p className="flex items-start">
                <span className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                  3
                </span>
                Submit your votes to finalize your selection
              </p>
            </div>
          </GuideBox>
          <InfoBox title="Voting Deadline" icon={Info} className="w-full">
            <p className="mt-3 text-gray-300">
              Please submit your votes before:
            </p>
            <p className="mt-1 text-lg font-medium text-amber-400">
              {new Date(votingStatus.votingEndsAt).toLocaleDateString(
                undefined,
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}
            </p>
          </InfoBox>
          <PlayerSelection
            selectedPlayers={selectedPlayers}
            players={votingStatus.players}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            maxSelections={3}
            showSubmitButton={selectedPlayers.length === 3}
          />
        </div>

        <div className="lg:col-span-2">
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
      </div>
    </div>
  );
}
