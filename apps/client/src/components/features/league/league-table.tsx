import Loading from "@/components/ui/loading";
import { CompetitionResponse } from "@repo/shared-types";
import { useLeagueStandings } from "@/hooks/use-league-standings";

interface LeagueTableProps {
  competition: CompetitionResponse;
}

export default function LeagueTable({ competition }: LeagueTableProps) {
  const { leagueStandings, isLoading } = useLeagueStandings(competition.id);

  if (isLoading) {
    return <Loading text="Loading league table..." />;
  }

  if (!leagueStandings || leagueStandings.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400">
        No teams in this league yet.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-lg border-2 border-accent/30 bg-bg/20">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-accent/30 bg-accent/10 text-accent">
              <th className="px-3 py-3 text-left text-sm font-bold lg:px-4 lg:text-base">
                Pos
              </th>
              <th className="px-3 py-3 text-left text-sm font-bold lg:px-4 lg:text-base">
                Team
              </th>
              <th className="px-1 py-3 text-center text-sm font-bold lg:px-3 lg:text-base">
                P
              </th>
              <th className="px-1 py-3 text-center text-sm font-bold lg:px-3 lg:text-base">
                W
              </th>
              <th className="px-1 py-3 text-center text-sm font-bold lg:px-3 lg:text-base">
                D
              </th>
              <th className="px-1 py-3 text-center text-sm font-bold lg:px-3 lg:text-base">
                L
              </th>
              <th className="hidden px-1 py-3 text-center text-sm font-bold lg:table-cell lg:px-3 lg:text-base">
                GF
              </th>
              <th className="hidden px-1 py-3 text-center text-sm font-bold lg:table-cell lg:px-3 lg:text-base">
                GA
              </th>
              <th className="px-1 py-3 text-center text-sm font-bold lg:px-3 lg:text-base">
                GD
              </th>
              <th className="px-3 py-3 text-center text-sm font-bold lg:px-4 lg:text-base">
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {leagueStandings.map((team, index) => (
              <tr
                key={team.id}
                className="border-b border-accent/10 text-white transition-colors hover:bg-accent/5"
              >
                <td className="px-2 py-3 text-left text-sm lg:px-4 lg:text-base">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent lg:h-7 lg:w-7 lg:text-sm">
                    {index + 1}
                  </span>
                </td>
                <td className="px-2 py-3 text-left text-sm font-medium lg:px-4 lg:text-base">
                  <span className="truncate">
                    {team.team?.name || team.name}
                  </span>
                </td>
                <td className="px-1 py-3 text-center text-sm lg:px-3 lg:text-base">
                  {team.played || 0}
                </td>
                <td className="px-1 py-3 text-center text-sm lg:px-3 lg:text-base">
                  {team.wins || 0}
                </td>
                <td className="px-1 py-3 text-center text-sm lg:px-3 lg:text-base">
                  {team.draws || 0}
                </td>
                <td className="px-1 py-3 text-center text-sm lg:px-3 lg:text-base">
                  {team.losses || 0}
                </td>
                <td className="hidden px-1 py-3 text-center text-sm lg:table-cell lg:px-3 lg:text-base">
                  {team.goalsFor || 0}
                </td>
                <td className="hidden px-1 py-3 text-center text-sm lg:table-cell lg:px-3 lg:text-base">
                  {team.goalsAgainst || 0}
                </td>
                <td className="px-1 py-3 text-center text-sm lg:px-3 lg:text-base">
                  <span
                    className={`${team.goalDifference >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {team.goalDifference > 0 ? "+" : ""}
                    {team.goalDifference || 0}
                  </span>
                </td>
                <td className="px-2 py-3 text-center text-sm font-bold lg:px-4 lg:text-base">
                  <span className="rounded bg-accent/20 px-2 py-1 text-accent">
                    {team.points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
