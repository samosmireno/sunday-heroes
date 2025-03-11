import { useSortPlayers } from "./use-sort-players";
import { PlayerTotals } from "@repo/logger";
import { UserTotals } from "../../../types/types";

interface StatsTableProps {
  playerStats: PlayerTotals[];
}

export default function StatsTable({ playerStats }: StatsTableProps) {
  const { sortedPlayers, sortOrder, sortColumn, sortPlayers } = useSortPlayers(
    playerStats,
    "goals",
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
                onClick={() => sortPlayers("matches")}
              >
                Matches
                {getSortArrow("totalMatches")}
              </th>
              <th
                className="p-2 text-left text-sm font-medium duration-300 hover:cursor-pointer hover:text-green-600 md:text-base"
                onClick={() => sortPlayers("goals")}
              >
                Goals{getSortArrow("totalGoals")}
              </th>
              <th
                className="p-2 text-left text-sm font-medium duration-300 hover:cursor-pointer hover:text-green-600 md:text-base"
                onClick={() => sortPlayers("assists")}
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
                    {player.matches}
                  </td>
                  <td className="text-center text-sm font-medium md:text-base md:font-semibold lg:p-2">
                    {player.goals}
                  </td>
                  <td className="text-center text-sm font-medium md:text-base md:font-semibold lg:p-2">
                    {player.assists}
                  </td>
                  {/* <td className="text-center text-sm font-medium md:text-base md:font-semibold lg:p-2">
                    {(player.votes
                      ? player.votes.reduce((total, vote) => total + vote, 0) /
                        player.matches
                      : 0
                    ).toFixed(2)}
                  </td> */}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
