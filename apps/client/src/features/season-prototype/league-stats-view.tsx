// PROTOTYPE — throwaway. Stats tab fed from computed per-season totals.
import { ReactNode } from "react";
import { LeaguePlayerTotals } from "@repo/shared-types";
import TopPerformers from "@/features/league/top-performers";
import PlayerStatsTable from "@/features/league/player-stats-table";
import { topPerformers } from "./fake-seasons";

interface LeagueStatsViewProps {
  players: LeaguePlayerTotals[];
  votingEnabled: boolean;
  caption?: ReactNode;
}

export default function LeagueStatsView({ players, votingEnabled, caption }: LeagueStatsViewProps) {
  if (players.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-bg/20 p-4 text-center sm:min-h-[250px] sm:p-6">
        <div className="max-w-md">
          <h3 className="mb-2 text-base font-medium text-gray-300 sm:text-lg">No Player Data</h3>
          <p className="text-sm text-gray-400 sm:text-base">
            Player statistics will appear here once matches have been played and completed.
          </p>
        </div>
      </div>
    );
  }
  const { topScorer, topAssister, topRated } = topPerformers(players);
  return (
    <div className="space-y-4 sm:space-y-6">
      {caption}
      <div className="rounded-lg bg-bg/10 p-3 sm:p-4 md:p-5">
        <h3 className="mb-3 text-base font-semibold text-accent sm:mb-4 sm:text-lg">Top Performers</h3>
        <TopPerformers topScorer={topScorer} topAssister={topAssister} topRated={topRated} votingEnabled={votingEnabled} />
      </div>
      <div className="overflow-hidden">
        <PlayerStatsTable players={players} votingEnabled={votingEnabled} />
      </div>
    </div>
  );
}
