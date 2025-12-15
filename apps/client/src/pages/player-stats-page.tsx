import Header from "@/components/ui/header";
import CompetitionPerformance from "@/features/player-stats/competition-performance";
import { usePlayerStats } from "@/features/player-stats/hooks/use-player-stats";
import PlayerOverview from "@/features/player-stats/player-overview";
import TopCompetitions from "@/features/player-stats/top-competitions";
import TopMatches from "@/features/player-stats/top-matches";
import TopTeammates from "@/features/player-stats/top-teammates";
import { useParams } from "react-router-dom";

export default function PlayerStatsPage() {
  const { playerId } = useParams() as { playerId: string };

  const { playerStats, isLoading } = usePlayerStats(playerId);
  return (
    <div className="relative min-w-0 flex-1 space-y-4 px-2 py-4 sm:px-4 sm:py-5">
      <Header
        title={playerStats?.player.nickname || "Player stats"}
        hasSidebar={true}
      />
      <PlayerOverview playerStats={playerStats} isLoading={isLoading} />
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="min-w-0">
          <TopMatches />
        </div>
        <div className="min-w-0">
          <TopCompetitions />
        </div>
      </div>
      <TopTeammates />
      <CompetitionPerformance />
    </div>
  );
}
