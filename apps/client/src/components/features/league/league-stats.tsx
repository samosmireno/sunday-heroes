import { CompetitionResponse } from "@repo/shared-types";
import { AlertCircle } from "lucide-react";
import Loading from "@/components/ui/loading";
import { useLeagueStats } from "@/hooks/use-league-stats";
import TopPerformers from "./top-performers";
import PlayerStatsTable from "./player-stats-table";

interface LeagueStatsProps {
  competition: CompetitionResponse;
}

export default function LeagueStats({ competition }: LeagueStatsProps) {
  const { players, topScorer, topAssister, topRated, isLoading, error } =
    useLeagueStats(competition.id);

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-4 sm:min-h-[300px] sm:p-6">
        <Loading text="Loading league statistics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-bg/20 p-4 text-center sm:min-h-[250px] sm:p-6">
        <div className="max-w-md">
          <div className="mb-3 text-red-400 sm:mb-4">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 sm:h-12 sm:w-12" />
            <h3 className="text-base font-medium sm:text-lg">
              Error Loading Stats
            </h3>
          </div>
          <p className="text-sm text-gray-400 sm:text-base">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-bg/20 p-4 text-center sm:min-h-[250px] sm:p-6">
        <div className="max-w-md">
          <h3 className="mb-2 text-base font-medium text-gray-300 sm:text-lg">
            No Player Data
          </h3>
          <p className="text-sm text-gray-400 sm:text-base">
            Player statistics will appear here once matches have been played and
            completed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="border-2border-accent/20 rounded-lg bg-bg/10 p-3 sm:p-4 md:p-5">
        <h3 className="mb-3 text-base font-semibold text-accent sm:mb-4 sm:text-lg">
          Top Performers
        </h3>
        <TopPerformers
          topScorer={topScorer}
          topAssister={topAssister}
          topRated={topRated}
          competition={competition}
        />
      </div>

      <div className="overflow-hidden">
        <PlayerStatsTable players={players} competition={competition} />
      </div>
    </div>
  );
}
