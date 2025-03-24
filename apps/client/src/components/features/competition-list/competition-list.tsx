import { DetailedCompetitionResponse } from "@repo/logger";
import { Edit, Eye, Trash2 } from "lucide-react";

interface CompetitionListProps {
  competitions: DetailedCompetitionResponse[];
}

export default function CompetitionList({
  competitions,
}: CompetitionListProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Type
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              Teams
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              Matches
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              Voting
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {competitions.map((competition) => (
            <tr key={competition.id} className="hover:bg-gray-50">
              <td className="px-4 py-4">
                <div className="font-medium">{competition.name}</div>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    competition.type === "LEAGUE"
                      ? "bg-blue-100 text-blue-700"
                      : competition.type === "DUEL"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {competition.type}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="font-medium">{competition.teams}</div>
                <div className="text-xs text-gray-500">
                  {competition.players} players
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="font-medium">{competition.matches}</div>
              </td>
              <td className="px-4 py-4 text-center">
                {competition.votingEnabled ? (
                  <>
                    <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Enabled
                    </span>
                    {(competition.pendingVotes ?? 0) > 0 && (
                      <span className="ml-1 inline-flex items-center rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        {competition.pendingVotes} pending
                      </span>
                    )}
                  </>
                ) : (
                  <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                    Disabled
                  </span>
                )}
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex justify-end space-x-1">
                  <button className="rounded-full p-1 text-blue-600 hover:bg-blue-100 hover:text-blue-800">
                    <Eye size={16} />
                  </button>
                  <button className="rounded-full p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-800">
                    <Edit size={16} />
                  </button>
                  <button className="rounded-full p-1 text-red-600 hover:bg-red-100 hover:text-red-800">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
