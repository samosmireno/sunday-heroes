// PROTOTYPE — throwaway. The Duel stats table with a toolbar slot and a
// caption that says which matches the "Min. matches %" denominator counts.
import { ReactNode, useState } from "react";
import { PlayerTotals } from "@repo/shared-types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSortPlayers } from "@/features/stats-table/use-sort-players";

interface DuelStatsViewProps {
  playerStats: PlayerTotals[];
  totalMatches: number;
  votingEnabled?: boolean;
  toolbar?: ReactNode;
  caption?: ReactNode;
}

const PERCENT_OPTIONS = ["all", "20", "30", "40", "50", "60", "70", "80", "90", "100"];
const th = "border-b-2 border-accent p-3 text-center text-xs uppercase tracking-wider text-accent hover:cursor-default hover:text-secondary md:text-sm";
const td = "px-2 text-center text-sm font-medium md:text-base md:font-semibold";

export default function DuelStatsView({ playerStats, totalMatches, votingEnabled, toolbar, caption }: DuelStatsViewProps) {
  const [matchPercent, setMatchPercent] = useState("all");
  const { sortedPlayers, sortOrder, sortColumn, sortPlayers } = useSortPlayers(playerStats, "goals", "desc");
  const filtered =
    matchPercent === "all"
      ? sortedPlayers
      : sortedPlayers.filter((p) => p.matches > Math.floor((parseInt(matchPercent) / 100) * totalMatches));
  const arrow = (key: keyof PlayerTotals) => (sortColumn === key ? (sortOrder === "asc" ? "↓" : "↑") : "");

  return (
    <>
      <div className="mb-2 flex flex-row flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-accent pb-3">
        <h2 className="py-1 text-xl uppercase text-accent" style={{ textShadow: "1px 1px 0 #000" }}>
          Stats
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {toolbar}
          <label htmlFor="proto-match-percent" className="text-sm font-medium text-accent">
            Min. matches %
          </label>
          <Select value={matchPercent} onValueChange={setMatchPercent}>
            <SelectTrigger id="proto-match-percent" className="w-[100px] border-2 border-accent/40 bg-gray-800/20 text-white">
              <SelectValue placeholder="Matches %" />
            </SelectTrigger>
            <SelectContent className="border-2 border-accent/40 bg-panel-bg">
              {PERCENT_OPTIONS.map((v) => (
                <SelectItem key={v} value={v} className="text-white hover:bg-gray-800/40">
                  {v === "all" ? "All" : `${v}%`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mb-4 text-xs text-gray-400">{caption}</div>
      <div className="relative overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary">
              <th className="sticky left-0 z-10 border-b-2 border-accent bg-primary p-3 text-left text-xs uppercase tracking-wider text-accent md:text-sm">Name</th>
              <th className={th} onClick={() => sortPlayers("matches")}>Matches{arrow("matches")}</th>
              <th className={th} onClick={() => sortPlayers("goals")}>Goals{arrow("goals")}</th>
              <th className={th} onClick={() => sortPlayers("assists")}>Assists{arrow("assists")}</th>
              <th className={th} onClick={() => sortPlayers("winRate")}>Win Rate{arrow("winRate")}</th>
              {votingEnabled && (
                <>
                  <th className={th} onClick={() => sortPlayers("numManOfTheMatch")}>MoM{arrow("numManOfTheMatch")}</th>
                  <th className={th} onClick={() => sortPlayers("rating")}>Rating{arrow("rating")}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="group relative border-b border-white/10 hover:bg-white/5">
                <td className="sticky left-0 z-10 bg-panel-bg px-2 py-1 text-left text-sm font-medium md:text-base md:font-semibold">{p.nickname}</td>
                <td className={td}>{p.matches}</td>
                <td className={td}>{p.goals}</td>
                <td className={td}>{p.assists}</td>
                <td className={td}>{p.winRate}</td>
                {votingEnabled && (
                  <>
                    <td className={td}>{p.numManOfTheMatch ?? 0}</td>
                    <td className={td}>{p.rating ?? "-"}</td>
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
