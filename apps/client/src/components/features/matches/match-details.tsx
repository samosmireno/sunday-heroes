import { useState } from "react";
import { Star, ArrowUp, Goal, Medal } from "lucide-react";
import { MatchPageResponse } from "@repo/shared-types";

interface MatchDetailsProps {
  match: MatchPageResponse;
}

export function MatchDetails({ match }: MatchDetailsProps) {
  const [activeTab, setActiveTab] = useState<0 | 1>(0); // 0 for home team, 1 for away team

  const homeTeamPlayers = match.playerStats.filter(
    (player) => player.isHome === true,
  );
  const awayTeamPlayers = match.playerStats.filter(
    (player) => player.isHome === false,
  );

  const activePlayers = activeTab === 0 ? homeTeamPlayers : awayTeamPlayers;
  const sortedPlayers = [...activePlayers].sort((a, b) => b.rating - a.rating);

  return (
    <div className="animate-fadeIn w-full rounded-b-lg border-t border-accent/30 bg-bg/50 p-4">
      <div className="mb-4 flex space-x-2 border-b border-accent/20 pb-2">
        <button
          onClick={() => setActiveTab(0)}
          className={`rounded-t-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 0
              ? "bg-accent/30 text-white"
              : "bg-bg/30 text-gray-300 hover:bg-accent/10"
          }`}
        >
          {match.teams[0]}
        </button>
        <button
          onClick={() => setActiveTab(1)}
          className={`rounded-t-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 1
              ? "bg-accent/30 text-white"
              : "bg-bg/30 text-gray-300 hover:bg-accent/10"
          }`}
        >
          {match.teams[1]}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-accent/10">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left text-xs font-bold text-accent">
                Player
              </th>
              <th className="px-2 py-2 text-center text-xs font-bold text-accent">
                <div className="flex items-center justify-center">
                  <Goal size={14} className="mr-1" />
                  Goals
                </div>
              </th>
              <th className="px-2 py-2 text-center text-xs font-bold text-accent">
                <div className="flex items-center justify-center">
                  <ArrowUp size={14} className="mr-1" />
                  Assists
                </div>
              </th>
              {match.votingEnabled && (
                <th className="px-2 py-2 text-center text-xs font-bold text-accent">
                  <div className="flex items-center justify-center">
                    <Star size={14} className="mr-1" />
                    Rating
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-accent/10">
            {sortedPlayers.map((player) => (
              <tr key={player.id} className="hover:bg-accent/5">
                <td className="px-2 py-2 text-sm font-medium text-gray-200">
                  <div className="flex items-center">
                    {sortedPlayers[0].id === player.id && (
                      <Medal size={14} className="mr-1.5 text-amber-400" />
                    )}
                    {player.nickname}
                  </div>
                </td>
                <td className="px-2 py-2 text-center text-sm text-gray-300">
                  {player.goals > 0 ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-900/30 text-green-400">
                      {player.goals}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-2 py-2 text-center text-sm text-gray-300">
                  {player.assists > 0 ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-900/30 text-blue-400">
                      {player.assists}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                {match.votingEnabled && (
                  <td className="px-2 py-2 text-center text-sm">
                    <div className="flex items-center justify-center">
                      <span
                        className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-medium ${
                          player.rating >= 8
                            ? "bg-green-900/30 text-green-400"
                            : player.rating >= 6
                              ? "bg-amber-900/30 text-amber-400"
                              : "bg-red-900/30 text-red-400"
                        } `}
                      >
                        {player.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <div>
          <p className="mb-1">
            <span className="font-medium text-accent">Goals:</span>{" "}
            {activePlayers.reduce((total, player) => total + player.goals, 0)}
          </p>
          <p>
            <span className="font-medium text-accent">Assists:</span>{" "}
            {activePlayers.reduce((total, player) => total + player.assists, 0)}
          </p>
        </div>
        {match.votingEnabled && (
          <div>
            <p>
              <span className="font-medium text-accent">Avg. Rating:</span>{" "}
              {(
                activePlayers.reduce(
                  (total, player) => total + player.rating,
                  0,
                ) / activePlayers.length
              ).toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
