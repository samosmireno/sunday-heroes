import { Target, Users, Star } from "lucide-react";
import { LeaguePlayerTotals, CompetitionResponse } from "@repo/shared-types";

interface TopPerformersProps {
  topScorer: LeaguePlayerTotals | null;
  topAssister: LeaguePlayerTotals | null;
  topRated: LeaguePlayerTotals | null;
  competition: CompetitionResponse;
}

export default function TopPerformers({
  topScorer,
  topAssister,
  topRated,
  competition,
}: TopPerformersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {topScorer && (
        <div className="rounded-lg border-2 border-green-500/30 bg-gradient-to-br from-green-900/20 to-green-800/10 p-4">
          <div className="mb-3 flex items-center">
            <Target className="mr-2 h-5 w-5 text-green-400" />
            <h3 className="text-sm font-medium text-green-400">Top Scorer</h3>
          </div>
          <div>
            <p className="truncate text-lg font-bold text-white">
              {topScorer.nickname}
            </p>
            <p className="mb-1 text-xs text-gray-400">{topScorer.teamName}</p>
            <p className="text-2xl font-bold text-green-400">
              {topScorer.goals || 0}
            </p>
            <p className="text-xs text-gray-400">
              {topScorer.matches
                ? (topScorer.goals / topScorer.matches).toFixed(1)
                : "0.0"}{" "}
              per match
            </p>
          </div>
        </div>
      )}

      {topAssister && (
        <div className="rounded-lg border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-4">
          <div className="mb-3 flex items-center">
            <Users className="mr-2 h-5 w-5 text-purple-400" />
            <h3 className="text-sm font-medium text-purple-400">
              Top Assister
            </h3>
          </div>
          <div>
            <p className="truncate text-lg font-bold text-white">
              {topAssister.nickname}
            </p>
            <p className="mb-1 text-xs text-gray-400">{topAssister.teamName}</p>
            <p className="text-2xl font-bold text-purple-400">
              {topAssister.assists || 0}
            </p>
            <p className="text-xs text-gray-400">
              {topAssister.matches
                ? (topAssister.assists / topAssister.matches).toFixed(1)
                : "0.0"}{" "}
              per match
            </p>
          </div>
        </div>
      )}

      {competition.votingEnabled && topRated && topRated.rating && (
        <div className="rounded-lg border-2 border-accent/30 bg-gradient-to-br from-accent/20 to-accent/10 p-4">
          <div className="mb-3 flex items-center">
            <Star className="mr-2 h-5 w-5 text-accent" />
            <h3 className="text-sm font-medium text-accent">Highest Rated</h3>
          </div>
          <div>
            <p className="truncate text-lg font-bold text-white">
              {topRated.nickname}
            </p>
            <p className="mb-1 text-xs text-gray-400">{topRated.teamName}</p>
            <p className="text-2xl font-bold text-accent">
              {topRated.rating.toFixed(1)}
            </p>
            <p className="text-xs text-gray-400">average rating</p>
          </div>
        </div>
      )}
    </div>
  );
}
