import { LeagueMatchResponse } from "@repo/logger";

interface LeagueMatchCardProps {
  match: LeagueMatchResponse;
  isSelected: boolean;
  onSelect: (match: LeagueMatchResponse) => void;
}

export default function LeagueMatchCard({
  match,
  isSelected,
  onSelect,
}: LeagueMatchCardProps) {
  return (
    <div
      onClick={() => onSelect(match)}
      className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:border-accent/60 ${
        isSelected
          ? "border-accent bg-accent/10"
          : "border-accent/20 bg-panel-bg hover:bg-accent/5"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {match.date
            ? new Date(match.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "TBD"}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-medium text-gray-300">
            {match.homeTeam.name}
          </span>
          <span className="text-lg font-bold text-accent">
            {match.homeScore}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-medium text-gray-300">
            {match.awayTeam.name}
          </span>
          <span className="text-lg font-bold text-accent">
            {match.awayScore}
          </span>
        </div>
      </div>
    </div>
  );
}
