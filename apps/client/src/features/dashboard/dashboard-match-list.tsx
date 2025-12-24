import { DashboardMatchResponse } from "@repo/shared-types";
import DashboardMatchCard from "./dashboard-match-card";
import { useNavigate } from "react-router-dom";

interface MatchListProps {
  matches: DashboardMatchResponse[];
  maxDisplay?: number;
}

export default function MatchList({ matches, maxDisplay = 5 }: MatchListProps) {
  const navigate = useNavigate();
  const displayedMatches = matches.slice(0, maxDisplay);
  return (
    <div className="flex h-full flex-col">
      <div className="border-b-2 border-accent/70 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2
            className="text-xl font-bold uppercase text-accent"
            style={{ textShadow: "1px 1px 0 #000" }}
          >
            Latest Matches
          </h2>

          <button
            className="text-sm font-bold text-accent hover:text-accent/80 hover:underline"
            onClick={() => navigate("/matches")}
            aria-label="View all matches"
          >
            View All
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4">
          {matches && matches.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {displayedMatches.map((match) => (
                <DashboardMatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg bg-bg/80 p-4 text-center sm:min-h-[250px] md:p-6">
              <div className="max-w-md">
                <p className="text-sm text-gray-400 sm:text-base lg:text-lg">
                  No recent matches. Scheduled matches will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
