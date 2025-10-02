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
  const hasTopRated = competition.votingEnabled && topRated && topRated.rating;
  const performersCount = [topScorer, topAssister, hasTopRated].filter(
    Boolean,
  ).length;

  return (
    <div
      className={`grid gap-3 sm:gap-4 ${
        performersCount === 1
          ? "mx-auto max-w-md grid-cols-1"
          : performersCount === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {topScorer && (
        <div className="border-2border-green-500/30 rounded-lg bg-gradient-to-br from-green-900/20 to-green-800/10 p-3 transition-all duration-200 hover:border-green-500/50 hover:shadow-lg sm:p-4">
          <div className="mb-2 flex items-center sm:mb-3">
            <Target className="mr-2 h-4 w-4 text-green-400 sm:h-5 sm:w-5" />
            <h3 className="text-xs font-medium text-green-400 sm:text-sm">
              Top Scorer
            </h3>
          </div>
          <div className="space-y-1">
            <p className="truncate text-base font-bold text-white sm:text-lg">
              {topScorer.nickname}
            </p>
            <p className="truncate text-xs text-gray-400 sm:text-sm">
              {topScorer.teamName}
            </p>
            <div className="flex flex-col items-start gap-1 sm:gap-0">
              <p className="text-xl font-bold text-green-400 sm:text-2xl">
                {topScorer.goals || 0}
                <span className="ml-1 text-xs text-gray-400 sm:text-sm">
                  {topScorer.goals === 1 ? "goal" : "goals"}
                </span>
              </p>
              <p className="text-xs text-gray-400 sm:text-sm">
                {topScorer.matches
                  ? (topScorer.goals / topScorer.matches).toFixed(1)
                  : "0.0"}{" "}
                per match
              </p>
            </div>
          </div>
        </div>
      )}

      {topAssister && (
        <div className="border-2border-purple-500/30 rounded-lg bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-3 transition-all duration-200 hover:border-purple-500/50 hover:shadow-lg sm:p-4">
          <div className="mb-2 flex items-center sm:mb-3">
            <Users className="mr-2 h-4 w-4 text-purple-400 sm:h-5 sm:w-5" />
            <h3 className="text-xs font-medium text-purple-400 sm:text-sm">
              Top Assister
            </h3>
          </div>
          <div className="space-y-1">
            <p className="truncate text-base font-bold text-white sm:text-lg">
              {topAssister.nickname}
            </p>
            <p className="truncate text-xs text-gray-400 sm:text-sm">
              {topAssister.teamName}
            </p>
            <div className="flex flex-col items-start gap-1 sm:gap-0">
              <p className="text-xl font-bold text-purple-400 sm:text-2xl">
                {topAssister.assists || 0}
                <span className="ml-1 text-xs text-gray-400 sm:text-sm">
                  {topAssister.assists === 1 ? "assist" : "assists"}
                </span>
              </p>
              <p className="text-xs text-gray-400 sm:text-sm">
                {topAssister.matches
                  ? (topAssister.assists / topAssister.matches).toFixed(1)
                  : "0.0"}{" "}
                per match
              </p>
            </div>
          </div>
        </div>
      )}

      {hasTopRated && (
        <div className="border-2border-accent/30 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 p-3 transition-all duration-200 hover:border-accent/50 hover:shadow-lg sm:p-4">
          <div className="mb-2 flex items-center sm:mb-3">
            <Star className="mr-2 h-4 w-4 text-accent sm:h-5 sm:w-5" />
            <h3 className="text-xs font-medium text-accent sm:text-sm">
              Highest Rated
            </h3>
          </div>
          <div className="space-y-1">
            <p className="truncate text-base font-bold text-white sm:text-lg">
              {topRated.nickname}
            </p>
            <p className="truncate text-xs text-gray-400 sm:text-sm">
              {topRated.teamName}
            </p>
            <div className="flex flex-col items-start gap-1 sm:gap-0">
              <p className="text-xl font-bold text-accent sm:text-2xl">
                {topRated.rating?.toFixed(1)}
                <span className="ml-1 text-xs text-gray-400 sm:text-sm">★</span>
              </p>
              <p className="text-xs text-gray-400 sm:text-sm">average rating</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
