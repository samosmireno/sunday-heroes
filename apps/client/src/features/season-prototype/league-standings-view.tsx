// PROTOTYPE — throwaway. The standings table fed from computed rows.
import { StandingsRow } from "./fake-seasons";

const th = "px-1 py-3 text-center text-sm font-bold lg:px-3 lg:text-base";
const td = "px-1 py-3 text-center text-sm lg:px-3 lg:text-base";

export default function LeagueStandingsView({ rows }: { rows: StandingsRow[] }) {
  if (rows.length === 0) {
    return <div className="py-8 text-center text-gray-400">No teams in this league yet.</div>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border-2 border-accent/30 bg-bg/20">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-accent/30 bg-accent/10 text-accent">
            <th className="px-3 py-3 text-left text-sm font-bold lg:px-4 lg:text-base">Pos</th>
            <th className="px-3 py-3 text-left text-sm font-bold lg:px-4 lg:text-base">Team</th>
            <th className={th}>P</th>
            <th className={th}>W</th>
            <th className={th}>D</th>
            <th className={th}>L</th>
            <th className={`hidden lg:table-cell ${th}`}>GF</th>
            <th className={`hidden lg:table-cell ${th}`}>GA</th>
            <th className={th}>GD</th>
            <th className="px-3 py-3 text-center text-sm font-bold lg:px-4 lg:text-base">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((team, index) => (
            <tr key={team.name} className="border-b border-accent/10 text-white transition-colors hover:bg-accent/5">
              <td className="px-2 py-3 text-left text-sm lg:px-4 lg:text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent lg:h-7 lg:w-7 lg:text-sm">
                  {index + 1}
                </span>
              </td>
              <td className="px-2 py-3 text-left text-sm font-medium lg:px-4 lg:text-base">{team.name}</td>
              <td className={td}>{team.played}</td>
              <td className={td}>{team.wins}</td>
              <td className={td}>{team.draws}</td>
              <td className={td}>{team.losses}</td>
              <td className={`hidden lg:table-cell ${td}`}>{team.goalsFor}</td>
              <td className={`hidden lg:table-cell ${td}`}>{team.goalsAgainst}</td>
              <td className={td}>
                <span className={team.goalDifference >= 0 ? "text-green-400" : "text-red-400"}>
                  {team.goalDifference > 0 ? "+" : ""}
                  {team.goalDifference}
                </span>
              </td>
              <td className="px-2 py-3 text-center text-sm font-bold lg:px-4 lg:text-base">
                <span className="rounded bg-accent/20 px-2 py-1 text-accent">{team.points}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
