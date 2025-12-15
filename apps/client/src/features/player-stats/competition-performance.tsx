import { useParams } from "react-router-dom";
import { usePlayerCompetitionStats } from "./hooks/use-player-competition-stats";
import PlayerCompetitionsTable from "./player-competition-stats";
import CompetitionPerformanceChart from "./chart/competition-performance-chart";

export default function CompetitionPerformance() {
  const { playerId } = useParams() as { playerId: string };
  const { playerCompetitionStats, isLoading } =
    usePlayerCompetitionStats(playerId);

  const competitionsInfo = playerCompetitionStats?.map((p) => ({
    name: p.name,
    id: p.competitionId,
  }));

  return (
    <div className="space-y-4">
      <CompetitionPerformanceChart competitionsInfo={competitionsInfo} />
      <PlayerCompetitionsTable
        playerCompetitionStats={playerCompetitionStats}
        isLoading={isLoading}
      />
    </div>
  );
}
