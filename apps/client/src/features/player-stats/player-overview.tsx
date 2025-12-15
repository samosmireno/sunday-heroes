import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Users, TrendingUp, Award } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PlayerStatsOverview } from "@repo/shared-types";
import { getResultColor } from "./utils";

interface PlayerOverviewProps {
  playerStats?: PlayerStatsOverview;
  isLoading: boolean;
}

export default function PlayerOverview({
  playerStats,
  isLoading,
}: PlayerOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card
            key={i}
            className="min-w-0 animate-pulse border-2 border-accent bg-panel-bg"
          >
            <CardHeader className="h-12 bg-gray-700/20" />
            <CardContent className="h-24 bg-gray-700/10" />
          </Card>
        ))}
      </div>
    );
  }

  if (!playerStats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-400">No stats available</p>
      </div>
    );
  }

  const { careerStats, recentForm } = playerStats;
  const winRate =
    careerStats.totalMatches > 0
      ? ((careerStats.record.wins / careerStats.totalMatches) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      <div className="grid min-w-0 gap-4 overflow-x-auto sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="min-w-0 border-2 border-accent bg-panel-bg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Matches
            </CardTitle>
            <Trophy className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {careerStats.totalMatches}
            </div>
            <p className="mt-1 text-sm text-gray-400">
              {careerStats.totalCompetitions}{" "}
              {careerStats.totalCompetitions === 1
                ? "competition"
                : "competitions"}
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-2 border-accent bg-panel-bg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Goals & Assists
            </CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {careerStats.totalGoals} / {careerStats.totalAssists}
            </div>
            <p className="mt-1 text-sm text-gray-400">
              {(
                (careerStats.totalGoals + careerStats.totalAssists) /
                (careerStats.totalMatches || 1)
              ).toFixed(2)}{" "}
              per match
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-2 border-accent bg-panel-bg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Average Rating
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {careerStats.avgRating.toFixed(2)}
            </div>
            <p className="mt-1 text-sm text-gray-400">Overall performance</p>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-2 border-accent bg-panel-bg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Record
            </CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {careerStats.record.wins}W - {careerStats.record.draws}D -{" "}
              {careerStats.record.losses}L
            </div>
            <p className="mt-1 text-sm text-gray-400">{winRate}% win rate</p>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-2 border-accent bg-panel-bg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Man of the Match
            </CardTitle>
            <Award className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {careerStats.manOfTheMatchCount}
            </div>
            <p className="mt-1 text-sm text-gray-400">
              {careerStats.totalMatches > 0
                ? (
                    (careerStats.manOfTheMatchCount /
                      careerStats.totalMatches) *
                    100
                  ).toFixed(1)
                : "0.0"}
              % of matches
            </p>
          </CardContent>
        </Card>
        <Card className="min-w-0 border-2 border-accent bg-panel-bg">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-400">
              Recent Form - Last 5 Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentForm.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recentForm.map((match, index) => (
                  <Popover key={index}>
                    <PopoverTrigger>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${getResultColor(match.result, true)}`}
                      >
                        {match.result}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto border-2 border-accent bg-panel-bg">
                      <div className="flex flex-col space-y-2 text-xs">
                        <p className="font-semibold text-white">
                          {match.opponent !== "Away" &&
                          match.opponent !== "Home"
                            ? `vs ${match.opponent}`
                            : ""}
                        </p>
                        <p className="text-gray-400">{match.competitionName}</p>
                        <p className="font-medium text-white">{match.score}</p>
                        <div className="flex gap-3 text-gray-400">
                          <span>Goals: {match.goals}</span>
                          <span>Assists: {match.assists}</span>
                        </div>
                        <p className="text-accent">
                          Rating: {match.rating.toFixed(1)}
                        </p>
                        <p className="text-gray-500">
                          {new Date(match.date).toLocaleDateString()}
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No recent matches</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
