import { PlayerListResponse } from "@repo/shared-types";
import { Star, Target, UserPlus, Users } from "lucide-react";

interface PlayerDetailsProps {
  player: PlayerListResponse;
}

export default function PlayerDetails({ player }: PlayerDetailsProps) {
  return (
    <tr>
      <td colSpan={8} className="border-b border-accent/20 p-0">
        <div className="animate-fadeIn w-full rounded-b-lg border-t border-accent/30 bg-bg/50 p-2 sm:p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-accent/10">
              <thead>
                <tr>
                  <th className="px-2 py-1.5 text-left text-xs font-bold text-accent sm:px-3 sm:py-2">
                    <span className="hidden sm:inline">Competition</span>
                    <span className="sm:hidden">Comp</span>
                  </th>
                  <th className="px-1 py-1.5 text-center text-xs font-bold text-accent sm:px-3 sm:py-2">
                    <div className="flex items-center justify-center">
                      <Users size={10} className="mr-0.5 sm:mr-1" />
                      <span className="hidden sm:inline">Matches</span>
                      <span className="sm:hidden">M</span>
                    </div>
                  </th>
                  <th className="hidden px-1 py-1.5 text-center text-xs font-bold text-accent sm:table-cell sm:px-3 sm:py-2">
                    <div className="flex items-center justify-center">
                      <Target size={10} className="mr-0.5 sm:mr-1" />
                      <span className="hidden lg:inline">Goals</span>
                      <span className="lg:hidden">G</span>
                    </div>
                  </th>
                  <th className="hidden px-1 py-1.5 text-center text-xs font-bold text-accent sm:table-cell sm:px-3 sm:py-2">
                    <div className="flex items-center justify-center">
                      <UserPlus size={10} className="mr-0.5 sm:mr-1" />
                      <span className="hidden lg:inline">Assists</span>
                      <span className="lg:hidden">A</span>
                    </div>
                  </th>
                  <th className="px-1 py-1.5 text-center text-xs font-bold text-accent sm:px-3 sm:py-2">
                    <div className="flex items-center justify-center">
                      <Star size={10} className="mr-0.5 sm:mr-1" />
                      <span className="hidden sm:inline">Rating</span>
                      <span className="sm:hidden">R</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/10">
                {player.competitions.map((competition) => {
                  const goalsPerMatch =
                    competition.matches > 0
                      ? (competition.goals / competition.matches).toFixed(1)
                      : "0.0";
                  const assistsPerMatch =
                    competition.matches > 0
                      ? (competition.assists / competition.matches).toFixed(1)
                      : "0.0";

                  return (
                    <tr key={competition.id} className="hover:bg-accent/5">
                      <td className="px-2 py-1.5 text-xs font-medium text-gray-200 sm:px-3 sm:py-2 sm:text-sm">
                        <div className="max-w-24 truncate sm:max-w-none">
                          {competition.name}
                        </div>
                        <div className="text-2xs mt-0.5 flex items-center space-x-2 text-gray-400 sm:hidden">
                          <span>{competition.goals}G</span>
                          <span>•</span>
                          <span>{competition.assists}A</span>
                        </div>
                      </td>
                      <td className="px-1 py-1.5 text-center text-xs text-gray-300 sm:px-3 sm:py-2 sm:text-sm">
                        <span className="text-2xs inline-flex h-5 w-6 items-center justify-center rounded bg-blue-900/30 text-blue-400 sm:h-6 sm:w-8 sm:text-xs">
                          {competition.matches}
                        </span>
                      </td>
                      <td className="hidden px-1 py-1.5 text-center text-xs text-gray-300 sm:table-cell sm:px-3 sm:py-2 sm:text-sm">
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-2xs inline-flex h-5 w-6 items-center justify-center rounded sm:h-6 sm:w-8 sm:text-xs ${
                              competition.goals > 0
                                ? "bg-green-900/30 text-green-400"
                                : "bg-gray-700/30 text-gray-500"
                            }`}
                          >
                            {competition.goals}
                          </span>
                          <span className="text-2xs mt-0.5 hidden text-gray-500 lg:block">
                            {goalsPerMatch}/game
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-1 py-1.5 text-center text-xs text-gray-300 sm:table-cell sm:px-3 sm:py-2 sm:text-sm">
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-2xs inline-flex h-5 w-6 items-center justify-center rounded sm:h-6 sm:w-8 sm:text-xs ${
                              competition.assists > 0
                                ? "bg-purple-900/30 text-purple-400"
                                : "bg-gray-700/30 text-gray-500"
                            }`}
                          >
                            {competition.assists}
                          </span>
                          <span className="text-2xs mt-0.5 hidden text-gray-500 lg:block">
                            {assistsPerMatch}/game
                          </span>
                        </div>
                      </td>
                      <td className="px-1 py-1.5 text-center text-xs sm:px-3 sm:py-2 sm:text-sm">
                        {competition.averageRating ? (
                          <span
                            className={`text-2xs inline-flex items-center justify-center rounded px-1.5 py-0.5 font-medium sm:px-2 sm:py-1 sm:text-xs ${
                              competition.averageRating >= 2
                                ? "bg-green-900/30 text-green-400"
                                : competition.averageRating >= 1
                                  ? "bg-amber-900/30 text-amber-400"
                                  : "bg-red-900/30 text-red-400"
                            }`}
                          >
                            {competition.averageRating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-2xs text-gray-500 sm:text-xs">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-accent/5 p-2 sm:mt-4 sm:grid-cols-4 sm:gap-4 sm:p-3">
            <div className="text-center">
              <div className="text-xs text-gray-400">Total Competitions</div>
              <div className="text-sm font-bold text-accent sm:text-lg">
                {player.competitions.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Best Performance</div>
              <div className="text-sm font-bold text-green-400 sm:text-lg">
                {Math.max(
                  ...player.competitions.map((c) => c.averageRating || 0),
                ).toFixed(1)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Most Goals</div>
              <div className="text-sm font-bold text-green-400 sm:text-lg">
                {Math.max(...player.competitions.map((c) => c.goals))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Most Assists</div>
              <div className="text-sm font-bold text-purple-400 sm:text-lg">
                {Math.max(...player.competitions.map((c) => c.assists))}
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
