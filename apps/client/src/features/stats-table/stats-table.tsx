import { useState } from "react";
import { useSortPlayers } from "./use-sort-players";
import { PlayerTotals } from "@repo/shared-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatsTableProps {
  playerStats: PlayerTotals[];
  totalMatches: number;
  votingEnabled?: boolean;
}

const MATCH_PERCENTAGE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "20%", value: "20" },
  { label: "30%", value: "30" },
  { label: "40%", value: "40" },
  { label: "50%", value: "50" },
  { label: "60%", value: "60" },
  { label: "70%", value: "70" },
  { label: "80%", value: "80" },
  { label: "90%", value: "90" },
  { label: "100%", value: "100" },
];

export default function StatsTable({
  playerStats,
  totalMatches,
  votingEnabled,
}: StatsTableProps) {
  const [matchPercent, setMatchPercent] = useState<string>("all");

  const { sortedPlayers, sortOrder, sortColumn, sortPlayers } = useSortPlayers(
    playerStats,
    "goals",
    "desc",
  );

  // Filter players based on selected match percentage
  const filteredPlayers =
    matchPercent === "all"
      ? sortedPlayers
      : sortedPlayers.filter(
          (player) =>
            player.matches >
            Math.floor((parseInt(matchPercent) / 100) * totalMatches),
        );

  const getSortArrow = (key: keyof PlayerTotals) => {
    if (sortColumn === key) {
      return sortOrder === "asc" ? "↓" : "↑";
    }
    return "";
  };

  return (
    <>
      <div className="mb-6 flex flex-row items-center justify-between gap-2 border-b-2 border-dashed border-accent pb-3">
        <h2
          className="py-1 text-xl uppercase text-accent"
          style={{ textShadow: "1px 1px 0 #000" }}
        >
          Stats
        </h2>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <label
            htmlFor="match-percent-select"
            className="text-sm font-medium text-accent"
          >
            Min. matches %
          </label>
          <Select value={matchPercent} onValueChange={setMatchPercent}>
            <SelectTrigger
              id="match-percent-select"
              className="w-full min-w-[100px] max-w-[140px] border-2 border-accent/40 bg-gray-800/20 text-white sm:w-[120px]"
            >
              <SelectValue placeholder="Matches %" />
            </SelectTrigger>
            <SelectContent className="border-2 border-accent/40 bg-panel-bg">
              {MATCH_PERCENTAGE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-white hover:bg-gray-800/40"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary">
              <th className="sticky left-0 z-10 border-b-2 border-accent bg-primary p-3 text-left text-xs uppercase tracking-wider text-accent md:text-sm">
                Name
              </th>
              <th
                className="border-b-2 border-accent p-2 text-center text-xs uppercase tracking-wider text-accent hover:cursor-default hover:text-secondary md:text-sm"
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
            {filteredPlayers &&
              filteredPlayers.map((player) => (
                <tr
                  className="group relative border-b border-white/10 hover:bg-white/5"
                  key={player.id}
                >
                  <td className="sticky left-0 z-10 bg-panel-bg px-2 py-1 text-left text-sm font-medium group-hover:bg-panel-bg md:text-base md:font-semibold">
                    <span className="relative z-10">{player.nickname}</span>
                    <div className="absolute inset-0 -z-10 bg-white/5 opacity-0 group-hover:opacity-100"></div>
                  </td>
                  <td className="px-2 text-center text-sm font-medium md:text-base md:font-semibold">
                    {player.matches}
                  </td>
                  <td className="px-2 text-center text-sm font-medium md:text-base md:font-semibold">
                    {player.goals}
                  </td>
                  <td className="px-2 text-center text-sm font-medium md:text-base md:font-semibold">
                    {player.assists}
                  </td>
                  <td className="px-2 text-center text-sm font-medium md:text-base md:font-semibold">
                    {player.winRate}
                  </td>
                  {votingEnabled && (
                    <>
                      <td className="px-2 text-center text-sm font-medium md:text-base md:font-semibold">
                        {player.numManOfTheMatch}
                      </td>
                      <td className="px-2 text-center text-sm font-medium md:text-base md:font-semibold">
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
