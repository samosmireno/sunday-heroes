import { Button } from "../../ui/button";
import { Check, Edit, Video } from "lucide-react";
import ConfirmationDialog from "../../ui/confirmation-dialog";
import FootballField from "../football-field/football-field";
import Loading from "../../ui/loading";
import { LeagueMatchResponse, MatchResponse, Role } from "@repo/shared-types";

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
    <div className="flex flex-1 flex-col">
      {/* Match Header */}
      <div className="border-b border-accent/30 p-3 sm:p-4 md:p-5 lg:p-6">
        <div className="text-center">
          <h3 className="mb-2 text-base font-bold text-accent sm:mb-3 sm:text-lg lg:text-xl">
            <span className="block sm:inline">
              {selectedMatch.homeTeam.name}
            </span>
            <span className="mx-2 hidden sm:inline">vs</span>
            <span className="block text-xs text-gray-400 sm:hidden">vs</span>
            <span className="block sm:inline">
              {selectedMatch.awayTeam.name}
            </span>
          </h3>
          <div className="mb-2 text-xl font-bold text-white sm:mb-3 sm:text-2xl lg:text-3xl">
            {selectedMatch.homeScore} - {selectedMatch.awayScore}
          </div>
          <div className="text-xs text-gray-400 sm:text-sm">
            <span className="block sm:inline">Round {selectedMatch.round}</span>
            <span className="mx-2 hidden sm:inline">•</span>
            <span className="block sm:inline">
              {selectedMatch.date
                ? new Date(selectedMatch.date).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Date TBD"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {role !== Role.PLAYER && (
        <div className="border-b border-accent/10 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            {match?.videoUrl && (
              <Button
                className="w-full border-2 border-accent/40 bg-bg/30 text-gray-300 hover:bg-accent/10 sm:w-auto"
                size="sm"
                onClick={() =>
                  window.open(match.videoUrl, "_blank", "noopener,noreferrer")
                }
              >
                <div className="flex items-center justify-center">
                  <Video className="mr-2 h-4 w-4" />
                  <span className="text-xs xl:text-sm">Watch</span>
                </div>
              </Button>
            )}
            <Button
              onClick={onEditMatch}
              className="w-full border-2 border-accent/40 bg-bg/30 text-gray-300 hover:bg-accent/10 sm:w-auto"
              size="sm"
            >
              <Edit className="mr-2 h-4 w-4" />
              <span className="text-xs xl:text-sm">Edit</span>
            </Button>

            {isMatchCompleted ? (
              <div className="rounded-md border-2 border-green-500/30 bg-green-900/20 px-3 py-2 text-center text-xs text-green-400 lg:text-sm">
                ✓ Match completed
              </div>
            ) : (
              !isMatchUnfinished && (
                <ConfirmationDialog
                  title="Mark match as Completed"
                  description={
                    <div className="space-y-3">
                      <p className="text-gray-200">
                        By marking this match as completed, you will finalize
                        the results and update the league standings.
                      </p>
                    </div>
                  }
                  triggerContent={
                    <div className="flex w-full items-center justify-center sm:w-auto">
                      <Check className="mr-2 h-4 w-4" />
                      <span className="text-xs xl:text-sm">
                        Mark as Completed
                      </span>
                    </div>
                  }
                  triggerClassName="w-full border-2 border-accent/40 bg-bg/30 text-gray-300 hover:bg-accent/10 sm:w-auto"
                  confirmText="Mark as Completed"
                  onConfirm={onCompleteMatch}
                  variant="info"
                  icon="complete"
                  loadingText="Confirming..."
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Match Details Content */}
      <div className="flex-1 overflow-hidden p-3 sm:p-4 md:p-5 lg:p-6">
        {match ? (
          <div className="h-full">
            <FootballField match={match} isEdited={false} />
          </div>
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg bg-bg/20 sm:min-h-[300px]">
            <Loading text="Loading match details..." />
          </div>
        )}
      </div>
    </div>
  );
}
