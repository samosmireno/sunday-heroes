import { DashboardMatchResponse } from "@repo/logger";
import DashboardMatchCard from "./dashboard-match-card";

interface MatchListProps {
  matches: DashboardMatchResponse[];
  title: string;
  onViewCalendar?: () => void;
  onMatchClick?: (matchId: string) => void;
}

export default function MatchList({
  matches,
  title,
  onViewCalendar,
  onMatchClick,
}: MatchListProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {onViewCalendar && (
          <button
            className="text-sm text-green-600 transition-colors hover:text-green-800"
            onClick={onViewCalendar}
          >
            View More
          </button>
        )}
      </div>
      <div className="space-y-3">
        {matches.map((match) => (
          <DashboardMatchCard
            key={match.id}
            match={match}
            venue={"Zlatna lopta"}
            onClick={() => onMatchClick && onMatchClick(match.id)}
          />
        ))}
      </div>
    </div>
  );
}
