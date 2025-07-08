import { CompetitionResponse } from "@repo/shared-types";
import { Users, TrendingUp } from "lucide-react";
import Loading from "../../ui/loading";
import { useLeagueStats } from "../../../hooks/use-league-stats";
import TopPerformers from "./top-performers";
import PlayerStatsTable from "./player-stats-table";

interface LeagueStatsProps {
  competition: CompetitionResponse;
}

export default function LeagueStats({ competition }: LeagueStatsProps) {
  const { players, topScorer, topAssister, topRated, isLoading, error } =
    useLeagueStats(competition.id);

  if (isLoading) {
    return <Loading text="Loading league statistics..." />;
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-red-400">
          <TrendingUp className="mx-auto mb-2 h-12 w-12" />
          <h3 className="text-lg font-medium">Error Loading Stats</h3>
        </div>
        <p className="text-gray-400">{error.message}</p>
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="py-12 text-center">
        <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-300">
          No Player Data
        </h3>
        <p className="text-gray-400">No matches have been played yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TopPerformers
        topScorer={topScorer}
        topAssister={topAssister}
        topRated={topRated}
        competition={competition}
      />
      <PlayerStatsTable players={players} competition={competition} />
    </div>
  );
}
