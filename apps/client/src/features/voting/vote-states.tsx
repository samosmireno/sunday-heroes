import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/ui/header";

interface VoteStateProps {
  onNavigateToDashboard: () => void;
}

export function ErrorState({
  onNavigateToDashboard,
  error,
}: VoteStateProps & { error: string }) {
  return (
    <div className="h-screen flex-1 bg-bg p-6">
      <Header title="Voting Error" hasSidebar={true} />
      <div className="relative flex flex-col items-center space-y-4 rounded-lg border-2 border-accent/70 bg-panel-bg p-6 text-center shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-red-500">Error</h2>
        <p className="text-gray-200">{error}</p>
        <Button
          onClick={onNavigateToDashboard}
          className="w-fit transform rounded-lg border-2 border-accent/50 bg-accent/20 px-3 py-2 text-accent shadow-md hover:bg-accent/30 sm:px-4"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export function NotFoundState({ onNavigateToDashboard }: VoteStateProps) {
  return (
    <div className="h-screen flex-1 bg-bg p-6">
      <Header title="Match not found" hasSidebar={true} />
      <div className="relative flex flex-col items-center space-y-4 rounded-lg border-2 border-accent/70 bg-panel-bg p-6 text-center shadow-lg">
        <p className="text-gray-200">
          The requested match could not be found or you don't have permission to
          vote.
        </p>
        <Button
          onClick={onNavigateToDashboard}
          className="w-fit transform rounded-lg border-2 border-accent/50 bg-accent/20 px-3 py-2 text-accent shadow-md hover:bg-accent/30 sm:px-4"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export function SuccessState({ onNavigateToDashboard }: VoteStateProps) {
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
            Thank you for voting for the best players in this match. Your votes
            have been recorded.
          </p>
          <Button
            onClick={onNavigateToDashboard}
            className="transform rounded-lg border-2 border-accent/50 bg-accent/20 px-3 py-2 text-accent shadow-md hover:bg-accent/30 sm:px-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AlreadyVotedState({ onNavigateToDashboard }: VoteStateProps) {
  return (
    <div className="h-screen flex-1 bg-bg p-6">
      <Header title="Already Voted" hasSidebar={true} />
      <div className="relative flex flex-col items-center space-y-4 rounded-lg border-2 border-accent/70 bg-panel-bg p-6 text-center shadow-lg">
        <p className="text-gray-200">
          You have already submitted your votes for this match. Thank you for
          participating!
        </p>
        <Button
          onClick={onNavigateToDashboard}
          className="w-fit transform rounded-lg border-2 border-accent/50 bg-accent/20 px-3 py-2 text-accent shadow-md hover:bg-accent/30 sm:px-4"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export function VotingClosedState({ onNavigateToDashboard }: VoteStateProps) {
  return (
    <div className="h-screen flex-1 bg-bg p-6">
      <Header title="Voting Closed" hasSidebar={true} />
      <div className="relative flex flex-col items-center space-y-4 rounded-lg border-2 border-accent/70 bg-panel-bg p-6 text-center shadow-lg">
        <p className="text-gray-200">
          Voting is no longer available for this match. The voting period has
          ended.
        </p>
        <Button
          onClick={onNavigateToDashboard}
          className="w-fit transform rounded-lg border-2 border-accent/50 bg-accent/20 px-3 py-2 text-accent shadow-md hover:bg-accent/30 sm:px-4"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
