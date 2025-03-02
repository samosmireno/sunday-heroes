import { usePlayerStats } from "./use-player-stats";
import { useSortPlayers } from "./use-sort-players";
import { MatchResponse } from "@repo/logger";
import { UserTotals } from "../../../types/types";

interface StatsTableProps {
  matches: MatchResponse[];
}

export default function StatsTable({ matches }: StatsTableProps) {
  const playersStats = usePlayerStats(matches);
  const { sortedPlayers, sortOrder, sortColumn, sortPlayers } = useSortPlayers(
    playersStats,
    "totalRating",
    "asc",
  );

  const getSortArrow = (key: keyof UserTotals) => {
    if (sortColumn === key) {
      return sortOrder === "asc" ? "↓" : "↑";
    }
    return "";
  };

  return (
    <>
      <h2 className="pb-4 text-xl font-semibold">Stats</h2>
      <div className="rounded-xl bg-green-100 px-4 py-2 shadow-sm md:px-8 md:py-4">
        <table>
          <thead className="-top-4 text-base font-extrabold text-gray-500">
            <tr>
              <th className="text-left text-sm font-medium md:text-base lg:p-2">
                Name
              </th>
              <th
                className="p-2 text-left text-sm font-medium duration-300 hover:cursor-pointer hover:text-green-600 md:text-base"
                onClick={() => sortPlayers("totalMatches")}
              >
                Matches
                {getSortArrow("totalMatches")}
              </th>
              <th
                className="p-2 text-left text-sm font-medium duration-300 hover:cursor-pointer hover:text-green-600 md:text-base"
                onClick={() => sortPlayers("totalGoals")}
              >
                Goals{getSortArrow("totalGoals")}
              </th>
              <th
                className="p-2 text-left text-sm font-medium duration-300 hover:cursor-pointer hover:text-green-600 md:text-base"
                onClick={() => sortPlayers("totalAssists")}
              >
                Assists{getSortArrow("totalAssists")}
              </th>
              {/* <th
                className="p-2 text-left text-sm font-medium duration-300 hover:cursor-pointer hover:text-green-600 md:text-base"
                onClick={() => sortPlayers("totalRating")}
              >
                Rating{getSortArrow("totalRating")}
              </th> */}
            </tr>
          </thead>
          <tbody>
            {sortedPlayers &&
              sortedPlayers.map((player) => (
                <tr className="" key={player.id}>
                  <td className="text-left text-sm font-medium md:text-base md:font-semibold lg:p-2">
                    {player.nickname}
                  </td>
                  <td className="text-center text-sm font-medium md:text-base md:font-semibold lg:p-2">
                    {player.totalMatches}
                  </td>
                  <td className="text-center text-sm font-medium md:text-base md:font-semibold lg:p-2">
                    {player.totalGoals}
                  </td>
                  <td className="text-center text-sm font-medium md:text-base md:font-semibold lg:p-2">
                    {player.totalAssists}
                  </td>
                  {/* <td className="text-center text-sm font-medium md:text-base md:font-semibold lg:p-2">
                    {(player.totalRating / player.totalMatches).toFixed(2)}
                  </td> */}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
