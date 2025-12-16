import { PlayerListResponse } from "@repo/shared-types";
import React from "react";
import InvitePlayerDialog from "../invite-player/invite-player-dialog";
import { PlayerTabsType } from "@/pages/players/types";
import { playerTabs } from "@/pages/players/constants";
import { useNavigate } from "react-router-dom";

interface PlayersListProps {
  players: PlayerListResponse[];
  activeFilter: PlayerTabsType;
}

export default function PlayersList({
  players,
  activeFilter,
}: PlayersListProps) {
  const navigate = useNavigate();

  return (
    <div className="relative -mx-2 sm:-mx-4 xl:-mx-0">
      <div className="overflow-x-hidden pb-2">
        <table className="min-w-full divide-y divide-accent/30">
          <thead>
            <tr className="border-b-2 border-accent/50">
              <th
                scope="col"
                className="whitespace-nowrap px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-accent sm:px-3 lg:px-4"
              >
                Name
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-1 py-2 text-center text-xs font-bold uppercase tracking-wider text-accent sm:px-2 lg:px-3"
              >
                <span className="hidden sm:inline">Competitions</span>
                <span className="sm:hidden">Comps</span>
              </th>
              <th
                scope="col"
                className="hidden whitespace-nowrap px-1 py-2 text-center text-xs font-bold uppercase tracking-wider text-accent sm:table-cell sm:px-2 lg:px-3"
              >
                <span className="hidden lg:inline">Matches</span>
                <span className="lg:hidden">M</span>
              </th>
              <th
                scope="col"
                className="hidden whitespace-nowrap px-1 py-2 text-center text-xs font-bold uppercase tracking-wider text-accent lg:table-cell lg:px-3"
              >
                <span className="hidden xl:inline">Goals</span>
                <span className="xl:hidden">G</span>
              </th>
              <th
                scope="col"
                className="hidden whitespace-nowrap px-1 py-2 text-center text-xs font-bold uppercase tracking-wider text-accent lg:table-cell lg:px-3"
              >
                <span className="hidden xl:inline">Assists</span>
                <span className="xl:hidden">A</span>
              </th>
              <th
                scope="col"
                className="hidden whitespace-nowrap px-1 py-2 text-center text-xs font-bold uppercase tracking-wider text-accent sm:table-cell sm:px-2 lg:px-3"
              >
                <span className="hidden lg:inline">Rating</span>
                <span className="lg:hidden">R</span>
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-1 py-2 text-center text-xs font-bold uppercase tracking-wider text-accent sm:px-2 lg:px-3"
              >
                Status
              </th>
              {activeFilter === playerTabs.ADMIN && (
                <th
                  scope="col"
                  className="whitespace-nowrap px-1 py-2 text-center text-xs font-bold uppercase tracking-wider text-accent sm:px-2 lg:px-3"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-accent/10">
            {players.map((player) => (
              <React.Fragment key={player.id}>
                <tr
                  className="cursor-pointer transition-colors hover:bg-accent/5"
                  onClick={() => navigate(`/player-stats/${player.id}`)}
                >
                  <td className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-3 lg:px-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-gray-200 sm:text-base">
                          {player.nickname}
                        </div>
                        <div className="mt-1 flex items-center space-x-2 text-xs text-gray-400 lg:hidden">
                          <span>{player.totalGoals || 0}G</span>
                          <span>•</span>
                          <span>{player.totalAssists || 0}A</span>
                          <span>•</span>
                          <span>{player.averageRating?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-center sm:px-2 sm:py-3 lg:px-3">
                    <div className="text-sm font-bold text-accent sm:text-base">
                      {player.competitionsCount}
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-1 py-2 text-center sm:table-cell sm:px-2 sm:py-3 lg:px-3">
                    <div className="text-sm text-gray-300">
                      {player.totalMatches || 0}
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-1 py-2 text-center lg:table-cell lg:px-3 lg:py-3">
                    <div className="text-sm text-gray-300">
                      {player.totalGoals || 0}
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-1 py-2 text-center lg:table-cell lg:px-3 lg:py-3">
                    <div className="text-sm text-gray-300">
                      {player.totalAssists || 0}
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-1 py-2 text-center sm:table-cell sm:px-2 sm:py-3 lg:px-3">
                    <div className="text-sm text-gray-300">
                      {player.averageRating
                        ? player.averageRating.toFixed(1)
                        : "-"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-1 py-2 text-center sm:px-2 sm:py-3 lg:px-3">
                    <div className="group relative">
                      <span
                        className={`text-2xs inline-flex items-center rounded-full px-1.5 py-0.5 font-medium sm:px-2 sm:py-1 sm:text-xs ${
                          player.isRegistered
                            ? "bg-green-900/30 text-green-400"
                            : "bg-gray-700/30 text-gray-400"
                        }`}
                      >
                        <span className="hidden sm:inline">
                          {player.isRegistered ? "Registered" : "Unregistered"}
                        </span>
                        <span className="sm:hidden">
                          {player.isRegistered ? "✓" : "✗"}
                        </span>
                      </span>
                      {player.isRegistered && player.email && (
                        <div className="text-2xs pointer-events-none absolute bottom-full left-1/4 z-10 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded-lg border-2 border-accent/30 bg-gray-900 px-2 py-1 text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:px-3 sm:py-2 sm:text-xs">
                          <div className="flex items-center">
                            <span className="mr-1">📧</span>
                            {player.email}
                          </div>
                          <div className="absolute left-1/2 top-full -translate-x-1/2 transform border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </td>
                  {activeFilter === playerTabs.ADMIN && (
                    <td className="whitespace-nowrap px-1 py-2 text-center sm:px-2 sm:py-3 lg:px-3">
                      <div className="flex items-center justify-center">
                        {!player.isRegistered && (
                          <InvitePlayerDialog
                            dashboardPlayerId={player.id}
                            playerNickname={player.nickname}
                          />
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
