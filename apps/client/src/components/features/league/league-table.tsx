import Loading from "../../ui/loading";
import { CompetitionResponse } from "@repo/shared-types";
import { useLeagueStandings } from "../../../hooks/use-league-standings";

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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-accent/30 text-accent">
            <th className="py-2 text-left font-bold">Pos</th>
            <th className="py-2 text-left font-bold">Team</th>
            <th className="py-2 text-center font-bold">P</th>
            <th className="py-2 text-center font-bold">W</th>
            <th className="py-2 text-center font-bold">D</th>
            <th className="py-2 text-center font-bold">L</th>
            <th className="py-2 text-center font-bold">GF</th>
            <th className="py-2 text-center font-bold">GA</th>
            <th className="py-2 text-center font-bold">GD</th>
            <th className="py-2 text-center font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {leagueStandings.map((team, index) => (
            <tr
              key={team.id}
              className={`border-b border-accent/10 text-white`}
            >
              <td className="py-2 text-left">{index + 1}</td>
              <td className="py-2 text-left font-medium">
                {team.team?.name || team.name}
              </td>
              <td className="py-2 text-center">{team.played | 0}</td>
              <td className="py-2 text-center">{team.wins | 0}</td>
              <td className="py-2 text-center">{team.draws | 0}</td>
              <td className="py-2 text-center">{team.losses | 0}</td>
              <td className="py-2 text-center">{team.goalsFor | 0}</td>
              <td className="py-2 text-center">{team.goalsAgainst | 0}</td>
              <td className="py-2 text-center">{team.goalDifference | 0}</td>
              <td className="py-2 text-center font-bold text-accent">
                {team.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
