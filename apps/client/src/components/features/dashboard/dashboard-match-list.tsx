import { DashboardMatchResponse } from "@repo/logger";
import DashboardMatchCard from "./dashboard-match-card";
import { Calendar } from "lucide-react";

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
    <div className="flex h-full flex-col">
      <div className="border-b-2 border-accent/70 bg-panel-bg px-4 py-3">
        <div className="flex items-center justify-between">
          <h2
            className="flex items-center text-xl font-bold uppercase tracking-wider text-accent"
            style={{ textShadow: "1px 1px 0 #000" }}
          >
            <Calendar className="mr-2 h-5 w-5" />
            {title}
          </h2>
          {onViewCalendar && (
            <button
              className="text-sm font-bold text-accent hover:text-accent/80"
              onClick={onViewCalendar}
              aria-label="View all matches"
            >
              View All
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-bg/40">
        <div className="h-full overflow-y-auto p-4">
          {matches && matches.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {matches.map((match) => (
                <DashboardMatchCard
                  key={match.id}
                  match={match}
                  onClick={() => onMatchClick && onMatchClick(match.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg bg-bg/20 p-4 text-center text-gray-400">
              No recent matches. Scheduled matches will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
