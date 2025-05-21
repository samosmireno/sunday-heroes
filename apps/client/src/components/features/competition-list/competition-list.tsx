import { DetailedCompetitionResponse } from "@repo/logger";
import { Calendar, CheckSquare, Trophy, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CompetitionListProps {
  competitions: DetailedCompetitionResponse[];
}

export default function CompetitionList({
  competitions,
}: CompetitionListProps) {
  const navigate = useNavigate();

  return (
    <div className="relative -mx-4 sm:-mx-0">
      <div className="overflow-x-auto pb-2">
        <table className="min-w-full divide-y divide-accent/30">
          <thead>
            <tr className="border-b-2 border-accent/50">
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-accent sm:px-4 sm:py-3"
              >
                Name
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-accent sm:px-4 sm:py-3"
              >
                Type
              </th>
              <th
                scope="col"
                className="hidden whitespace-nowrap px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-accent sm:table-cell sm:px-4 sm:py-3"
              >
                Teams
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-accent sm:px-4 sm:py-3"
              >
                Matches
              </th>
              <th
                scope="col"
                className="hidden whitespace-nowrap px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-accent sm:px-4 sm:py-3 lg:table-cell"
              >
                Voting
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-2 text-right text-xs font-bold uppercase tracking-wider text-accent sm:px-4 sm:py-3"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-accent/30">
            {competitions.map((competition) => (
              <tr key={competition.id} className="hover:bg-bg/30">
                <td className="whitespace-nowrap px-3 py-3 sm:px-4 sm:py-4">
                  <div
                    className="max-w-[100px] truncate text-sm font-bold text-gray-200 sm:max-w-[180px] md:max-w-[250px]"
                    title={competition.name}
                  >
                    {competition.name}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 sm:px-4 sm:py-4">
                  <span
                    className={`text-2xs inline-block rounded px-1.5 py-0.5 font-bold sm:px-2 sm:py-1 sm:text-xs ${
                      competition.type === "LEAGUE"
                        ? "bg-league-800/40 text-league-300"
                        : competition.type === "DUEL"
                          ? "bg-duel-800/40 text-duel-300"
                          : "bg-knockout-800/40 text-knockout-300"
                    }`}
                  >
                    {competition.type}
                  </span>
                </td>
                <td className="hidden whitespace-nowrap px-3 py-3 text-center sm:table-cell sm:px-4 sm:py-4">
                  <div className="text-sm font-bold text-accent">
                    {competition.teams}
                  </div>
                  <div className="text-2xs text-gray-400 sm:text-xs">
                    {competition.players} players
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-center sm:px-4 sm:py-4">
                  <div className="text-sm font-bold text-accent">
                    {competition.matches}
                  </div>
                </td>
                <td className="hidden whitespace-nowrap px-3 py-3 text-center sm:px-4 sm:py-4 lg:table-cell">
                  {competition.votingEnabled ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xs inline-flex items-center rounded bg-amber-900/30 px-1.5 py-0.5 font-bold text-amber-400 sm:text-xs">
                        <CheckSquare
                          size={12}
                          className="mr-1 hidden sm:inline"
                        />
                        Enabled
                      </span>
                      {(competition.pendingVotes ?? 0) > 0 && (
                        <span className="text-2xs inline-flex items-center rounded bg-amber-900/30 px-1.5 py-0.5 font-bold text-amber-400 sm:text-xs">
                          {competition.pendingVotes} pending
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-2xs inline-flex items-center rounded bg-bg/40 px-1.5 py-0.5 font-medium text-gray-400 sm:text-xs">
                      Disabled
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right sm:px-4 sm:py-4">
                  <div className="flex justify-end space-x-1 sm:space-x-2">
                    <button
                      onClick={() => navigate(`/competition/${competition.id}`)}
                      className="rounded-full bg-accent/20 p-1 text-accent hover:bg-accent/30 sm:p-1.5"
                      title="View competition"
                    >
                      <Trophy size={14} className="sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/matches/${competition.id}`)}
                      className="rounded-full bg-bg/30 p-1 text-gray-400 hover:bg-accent/10 hover:text-gray-300 sm:p-1.5"
                      title="View matches"
                    >
                      <Calendar size={14} className="sm:h-4 sm:w-4" />
                    </button>
                    <button
                      className="hidden rounded-full bg-bg/30 p-1 text-gray-400 hover:bg-accent/10 hover:text-gray-300 sm:inline-block sm:p-1.5"
                      title="View teams"
                    >
                      <Users size={14} className="sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
