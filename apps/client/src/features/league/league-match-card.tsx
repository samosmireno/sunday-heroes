import { LeagueMatchResponse } from "@repo/shared-types";
import { displayedScore, leftNotCompleted } from "./fixture-display";
import NotCompletedTag from "./not-completed-tag";

interface LeagueMatchCardProps {
  match: LeagueMatchResponse;
  isSelected: boolean;
  onSelect: (match: LeagueMatchResponse) => void;
  /** The R-number on the card, for a list without round tabs (All seasons). */
  showRound?: boolean;
}

export default function LeagueMatchCard({
  match,
  isSelected,
  onSelect,
  showRound = false,
}: LeagueMatchCardProps) {
  const notCompleted = leftNotCompleted(match);
  const score = displayedScore(match);
  const scoreClass = notCompleted ? "text-gray-500" : "text-accent";

  return (
    <div
      onClick={() => onSelect(match)}
      className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:border-accent/60 ${
        isSelected
          ? "border-accent bg-accent/10"
          : "border-accent/20 bg-panel-bg hover:bg-accent/5"
      } ${notCompleted ? "opacity-70" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {showRound && (
            <span className="mr-2 font-semibold text-accent/80">
              R{match.round}
            </span>
          )}
          {match.date
            ? new Date(match.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "TBD"}
        </span>
        {notCompleted && <NotCompletedTag />}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-medium text-gray-300">
            {match.homeTeam.name}
          </span>
          <span className={`text-lg font-bold ${scoreClass}`}>
            {score.home}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-medium text-gray-300">
            {match.awayTeam.name}
          </span>
          <span className={`text-lg font-bold ${scoreClass}`}>
            {score.away}
          </span>
        </div>
      </div>
    </div>
  );
}
