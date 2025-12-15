import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeammateStats } from "@repo/shared-types";
import { Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTopTeammates } from "./hooks/use-top-teammates";

export default function TopTeammates() {
  const { playerId } = useParams() as { playerId: string };
  const { topTeammates, isLoading } = useTopTeammates(playerId);

  if (isLoading) {
    return (
      <Card className="border-2 border-accent bg-panel-bg">
        <CardHeader className="animate-pulse">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gray-700/20" />
            <div className="h-6 w-32 rounded bg-gray-700/20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-lg bg-gray-700/10"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topTeammates || topTeammates.length === 0) {
    return (
      <Card className="border-2 border-accent bg-panel-bg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
            <Users className="h-5 w-5 text-accent" />
            Top Teammates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">No teammates data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-accent bg-panel-bg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
          Top Teammates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {topTeammates.map((teammate: TeammateStats, index: number) => (
            <Link
              key={teammate.dashboardPlayerId}
              to={`/player-stats/${teammate.dashboardPlayerId}`}
              className="group block"
            >
              <div className="rounded-lg border-2 border-accent/30 bg-gray-800/20 p-3 transition-all hover:border-accent hover:bg-gray-800/40">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">
                    {index + 1}
                  </div>
                  <p className="flex-1 truncate text-sm font-semibold text-white">
                    {teammate.nickname}
                    {teammate.isRegistered && (
                      <span className="ml-1 text-xs text-accent">★</span>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">
                    {teammate.matchesTogether}{" "}
                    {teammate.matchesTogether === 1 ? "match" : "matches"}
                  </p>
                  <div className="text-sm font-bold text-white">
                    {teammate.record.wins}W-{teammate.record.draws}D-
                    {teammate.record.losses}L
                  </div>
                  <div className="text-xs text-gray-400">
                    {teammate.winRate.toFixed(1)}% win rate
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
