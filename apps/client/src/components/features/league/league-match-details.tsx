import { Button } from "../../ui/button";
import { Check, Edit } from "lucide-react";
import ConfirmationDialog from "../../ui/confirmation-dialog";
import FootballField from "../football-field/football-field";
import Loading from "../../ui/loading";
import { LeagueMatchResponse, MatchResponse, Role } from "@repo/logger";

interface LeagueMatchDetailsProps {
  role: Role;
  selectedMatch: LeagueMatchResponse;
  match: MatchResponse | null;
  isMatchCompleted: boolean;
  isMatchUnfinished: boolean;
  onEditMatch: () => void;
  onCompleteMatch: () => Promise<void>;
}

export default function LeagueMatchDetails({
  role,
  selectedMatch,
  match,
  isMatchCompleted,
  isMatchUnfinished,
  onEditMatch,
  onCompleteMatch,
}: LeagueMatchDetailsProps) {
  return (
    <>
      <div className="border-b border-accent/30 p-4">
        <div className="text-center">
          <h3 className="mb-1 text-lg font-bold text-accent">
            {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
          </h3>
          <div className="mb-2 text-2xl font-bold text-white">
            {selectedMatch.homeScore} - {selectedMatch.awayScore}
          </div>
          <div className="text-sm text-gray-400">
            Round {selectedMatch.round} •{" "}
            {selectedMatch.date
              ? new Date(selectedMatch.date).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Date TBD"}
          </div>
        </div>
      </div>
      {role !== Role.PLAYER && (
        <div className="mt-3 flex items-center justify-around">
          <Button
            onClick={onEditMatch}
            className="border-2 border-accent/40 bg-bg/30 text-gray-300 hover:bg-accent/10"
            size="sm"
          >
            <Edit className="mr-1 h-4 w-4" />
            Edit Match
          </Button>
          {isMatchCompleted ? (
            <div className="text-xs text-gray-300">Match completed</div>
          ) : (
            !isMatchUnfinished && (
              <ConfirmationDialog
                title="Mark match as Completed"
                description={
                  <div className="space-y-3">
                    <p className="text-gray-200">
                      By marking this match as completed, you will finalize the
                      results and update the league standings.
                    </p>
                  </div>
                }
                triggerContent={
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    Mark as Completed
                  </>
                }
                triggerClassName="border-2 text-xs border-accent/40 bg-bg/30 text-gray-300 hover:bg-accent/10"
                confirmText="Mark as Completed"
                onConfirm={onCompleteMatch}
                variant="info"
                icon="complete"
                loadingText="Confirming..."
              />
            )
          )}
        </div>
      )}

      <div className="flex-1 p-4">
        {match ? (
          <FootballField match={match} isEdited={false} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Loading text="Loading match details..." />
          </div>
        )}
      </div>
    </>
  );
}
