import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoBox } from "@/components/ui/info-box";

/**
 * What a player sees when the submit was refused because their session was
 * gone. It takes the submit button's place, which is where they were looking
 * when they pressed it.
 *
 * It leads with the fact, because the fact is the whole bug: the votes were
 * not recorded. What used to happen here was a bare redirect to the landing
 * page — no message, no picks, and a player who reported the vote as done.
 */
export function VoteNotSubmittedNotice({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="mt-4 space-y-3">
      <InfoBox
        title="Your votes were not submitted"
        icon={AlertTriangle}
        variant="error"
      >
        <p>
          You were signed out before your votes reached us, so nothing was
          recorded for this match.
        </p>
        <p className="mt-2">
          Your picks are saved. Sign in and you will come straight back to this
          ballot to submit them.
        </p>
      </InfoBox>
      <Button
        onClick={onSignIn}
        className="w-full transform bg-accent text-bg transition-all hover:bg-accent/80"
      >
        Sign in and submit
      </Button>
    </div>
  );
}
