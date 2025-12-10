import { useSortPlayers } from "./use-sort-players";
import { PlayerTotals } from "@repo/shared-types";

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
    "desc",
  );

  const getSortArrow = (key: keyof PlayerTotals) => {
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
      <div className="relative overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary">
              <th className="sticky left-0 z-10 border-b-2 border-accent bg-primary p-3 text-left text-xs uppercase tracking-wider text-accent md:text-sm">
                Name
              </th>
              <th
                className="border-b-2 border-accent p-3 text-center text-xs uppercase tracking-wider text-accent hover:cursor-default hover:text-secondary md:text-sm"
                onClick={() => sortPlayers("matches")}
              >
                <span className="inline md:hidden" title="Matches">
                  🏟️
                </span>
                <span className="hidden md:inline">Matches</span>
                {getSortArrow("matches")}
              </th>
              <th
                className="border-b-2 border-accent p-3 text-center text-xs uppercase tracking-wider text-accent hover:cursor-default hover:text-secondary md:text-sm"
                onClick={() => sortPlayers("goals")}
              >
                <span className="inline md:hidden" title="Goals">
                  ⚽
                </span>
                <span className="hidden md:inline">Goals</span>
                {getSortArrow("goals")}
              </th>
              <th
                className="border-b-2 border-accent p-3 text-center text-xs uppercase tracking-wider text-accent hover:cursor-default hover:text-secondary md:text-sm"
                onClick={() => sortPlayers("assists")}
              >
                <span className="inline md:hidden" title="Assists">
                  🅰️
                </span>
                <span className="hidden md:inline">Assists</span>
                {getSortArrow("assists")}
              </th>
              <th
                className="border-b-2 border-accent p-3 text-center text-xs uppercase tracking-wider text-accent hover:cursor-default hover:text-secondary md:text-sm"
                onClick={() => sortPlayers("winRate")}
              >
                <span>Win Rate</span>
                {getSortArrow("winRate")}
              </th>
              {votingEnabled && (
                <>
                  <th
                    className="border-b-2 border-accent p-3 text-center text-xs uppercase tracking-wider text-accent hover:cursor-default hover:text-secondary md:text-sm"
                    onClick={() => sortPlayers("numManOfTheMatch")}
                  >
                    <span>MoM</span>
                    {getSortArrow("numManOfTheMatch")}
                  </th>
                  <th
                    className="border-b-2 border-accent p-3 text-center text-xs uppercase tracking-wider text-accent hover:cursor-default hover:text-secondary md:text-sm"
                    onClick={() => sortPlayers("rating")}
                  >
                    <span className="inline md:hidden" title="Rating">
                      ⭐
                    </span>
                    <span className="hidden md:inline">Rating</span>
                    {getSortArrow("rating")}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedPlayers &&
              sortedPlayers.map((player) => (
                <tr className="group border-b border-white/10" key={player.id}>
                  <td className="sticky left-0 z-10 bg-panel-bg p-2 text-left text-sm font-medium group-hover:bg-white/5 md:text-base md:font-semibold">
                    {player.nickname}
                  </td>
                  <td className="p-2 text-center text-sm font-medium group-hover:bg-white/5 md:text-base md:font-semibold">
                    {player.matches}
                  </td>
                  <td className="p-2 text-center text-sm font-medium group-hover:bg-white/5 md:text-base md:font-semibold">
                    {player.goals}
                  </td>
                  <td className="p-2 text-center text-sm font-medium group-hover:bg-white/5 md:text-base md:font-semibold">
                    {player.assists}
                  </td>
                  <td className="p-2 text-center text-sm font-medium group-hover:bg-white/5 md:text-base md:font-semibold">
                    {player.winRate}
                  </td>
                  {votingEnabled && (
                    <>
                      <td className="p-2 text-center text-sm font-medium group-hover:bg-white/5 md:text-base md:font-semibold">
                        {player.numManOfTheMatch}
                      </td>
                      <td className="p-2 text-center text-sm font-medium group-hover:bg-white/5 md:text-base md:font-semibold">
                        {player.rating}
                      </td>
                    </>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
