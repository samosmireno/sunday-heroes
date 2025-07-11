import { useSortPlayers } from "./use-sort-players";
import { PlayerTotals } from "@repo/shared-types";
import { UserTotals } from "../../../types/types";

interface StatsTableProps {
  playerStats: PlayerTotals[];
  votingEnabled?: boolean;
}

export default function StatsTable({
  playerStats,
  votingEnabled,
}: StatsTableProps) {
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
      <div className="mb-6 flex items-center justify-between border-b-2 border-dashed border-accent pb-3">
        <h2
          className="py-1 text-xl uppercase text-accent"
          style={{ textShadow: "1px 1px 0 #000" }}
        >
          Stats
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary">
              <th className="border-b-2 border-accent p-2 text-left text-sm uppercase tracking-wider text-accent lg:p-3">
                Name
              </th>
              <th
                className="border-b-2 border-accent p-2 text-center text-sm uppercase tracking-wider text-accent hover:cursor-default hover:text-secondary lg:p-3"
                onClick={() => sortPlayers("matches")}
              >
                Matches
                {getSortArrow("totalMatches")}
              </th>
              <th
                className="border-b-2 border-accent p-2 text-center text-sm uppercase tracking-wider text-accent hover:cursor-default hover:text-secondary lg:p-3"
                onClick={() => sortPlayers("goals")}
              >
                Goals{getSortArrow("totalGoals")}
              </th>
              <th
                className="border-b-2 border-accent p-2 text-center text-sm uppercase tracking-wider text-accent hover:cursor-default hover:text-secondary lg:p-3"
                onClick={() => sortPlayers("assists")}
              >
                Assists{getSortArrow("totalAssists")}
              </th>
              {votingEnabled && (
                <th
                  className="border-b-2 border-accent p-2 text-center text-sm uppercase tracking-wider text-accent hover:cursor-default hover:text-secondary lg:p-3"
                  onClick={() => sortPlayers("rating")}
                >
                  Rating{getSortArrow("totalRating")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedPlayers &&
              sortedPlayers.map((player) => (
                <tr
                  className="border-b border-white/10 hover:bg-white/5"
                  key={player.id}
                >
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
                  {votingEnabled && (
                    <td className="text-center text-sm font-medium md:text-base md:font-semibold lg:p-2">
                      {player.rating}
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
