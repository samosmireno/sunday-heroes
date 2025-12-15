import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerCompetitionStats } from "@repo/shared-types";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";

interface PlayerCompetitionsTableProps {
  playerCompetitionStats?: PlayerCompetitionStats[];
  isLoading: boolean;
}

export default function PlayerCompetitionsTable({
  playerCompetitionStats,
  isLoading,
}: PlayerCompetitionsTableProps) {
  if (isLoading) {
    return (
      <Card className="border-2 border-accent bg-panel-bg">
        <CardHeader className="animate-pulse">
          <div className="h-6 w-48 rounded bg-gray-700/20" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-gray-700/10"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!playerCompetitionStats || playerCompetitionStats.length === 0) {
    return (
      <Card className="border-2 border-accent bg-panel-bg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Stats by Competition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            No competition stats available
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRecordColor = (type: "wins" | "draws" | "losses") => {
    switch (type) {
      case "wins":
        return "text-green-500";
      case "draws":
        return "text-yellow-500";
      case "losses":
        return "text-red-500";
    }
  };

  return (
    <Card className="border-2 border-accent bg-panel-bg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">
          Stats by Competition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-accent/30">
                <th className="pb-2 text-left text-xs font-medium uppercase text-gray-400">
                  Competition
                </th>
                <th className="pb-2 text-center text-xs font-medium uppercase text-gray-400">
                  Type
                </th>
                <th className="pb-2 text-center text-xs font-medium uppercase text-gray-400">
                  Matches
                </th>
                <th className="pb-2 text-center text-xs font-medium uppercase text-gray-400">
                  Record (W-D-L)
                </th>
                <th className="pb-2 text-center text-xs font-medium uppercase text-gray-400">
                  Goals
                </th>
                <th className="pb-2 text-center text-xs font-medium uppercase text-gray-400">
                  Assists
                </th>
                <th className="pb-2 text-center text-xs font-medium uppercase text-gray-400">
                  Avg Rating
                </th>
              </tr>
            </thead>
            <tbody>
              {playerCompetitionStats.map((comp: PlayerCompetitionStats) => (
                <tr
                  key={comp.competitionId}
                  className="group transition-colors hover:bg-gray-800/40"
                >
                  <td className="py-2">
                    <Link
                      to={`/competition/${comp.competitionId}`}
                      className="block rounded-lg px-2 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-accent group-hover:bg-accent/20 group-hover:text-accent"
                      tabIndex={0}
                    >
                      <span className="text-sm font-semibold text-white group-hover:text-accent">
                        {comp.name}
                      </span>
                    </Link>
                  </td>
                  <td className="py-2 text-center">
                    <span className="text-sm text-gray-400">{comp.type}</span>
                  </td>
                  <td className="py-2 text-center">
                    <span className="text-sm font-medium text-white">
                      {comp.matches}
                    </span>
                  </td>
                  <td className="py-2 text-center">
                    <span className="text-sm font-medium text-white">
                      <span className={getRecordColor("wins")}>
                        {comp.record.wins}
                      </span>
                      {" - "}
                      <span className={getRecordColor("draws")}>
                        {comp.record.draws}
                      </span>
                      {" - "}
                      <span className={getRecordColor("losses")}>
                        {comp.record.losses}
                      </span>
                    </span>
                  </td>
                  <td className="py-2 text-center">
                    <span className="text-sm font-medium text-white">
                      {comp.goals}
                    </span>
                  </td>
                  <td className="py-2 text-center">
                    <span className="text-sm font-medium text-white">
                      {comp.assists}
                    </span>
                  </td>
                  <td className="py-2 text-center">
                    <span className="rounded-full bg-accent/20 px-2 py-1 text-sm font-bold text-accent">
                      {comp.avgRating.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 lg:hidden">
          {playerCompetitionStats.map((comp: PlayerCompetitionStats) => (
            <Link
              key={comp.competitionId}
              to={`/competition/${comp.competitionId}`}
              className="block"
            >
              <div className="rounded-lg border-2 border-accent/30 bg-gray-800/20 p-4 transition-all hover:border-accent hover:bg-gray-800/40">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/20">
                    <Trophy className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-white">
                      {comp.name}
                    </p>
                    <p className="text-xs text-gray-400">{comp.type}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="rounded-full bg-accent/20 px-2.5 py-1 text-sm font-bold text-accent">
                      {comp.avgRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Matches</p>
                    <p className="text-base font-semibold text-white">
                      {comp.matches}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Record</p>
                    <p className="text-base font-semibold text-white">
                      <span className={getRecordColor("wins")}>
                        {comp.record.wins}
                      </span>
                      -
                      <span className={getRecordColor("draws")}>
                        {comp.record.draws}
                      </span>
                      -
                      <span className={getRecordColor("losses")}>
                        {comp.record.losses}
                      </span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Goals</p>
                    <p className="text-base font-semibold text-white">
                      {comp.goals}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Assists</p>
                    <p className="text-base font-semibold text-white">
                      {comp.assists}
                    </p>
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
