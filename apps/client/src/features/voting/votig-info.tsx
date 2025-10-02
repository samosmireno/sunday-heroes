import { GuideBox } from "@/components/ui/guide-box";
import { InfoBox } from "@/components/ui/info-box";
import { Info } from "lucide-react";

export function VotingGuide() {
  return (
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
          Your first pick gets 3 points, second gets 2 points, third gets 1
          point
        </p>
        <p className="flex items-start">
          <span className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
            3
          </span>
          Submit your votes to finalize your selection
        </p>
      </div>
    </GuideBox>
  );
}

export function VotingDeadline({ votingEndsAt }: { votingEndsAt: string }) {
  return (
    <InfoBox title="Voting Deadline" icon={Info} className="w-full">
      <p className="mt-3 text-gray-300">Please submit your votes before:</p>
      <p className="mt-1 text-lg font-medium text-amber-400">
        {new Date(votingEndsAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </InfoBox>
  );
}
