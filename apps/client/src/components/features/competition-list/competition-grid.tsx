import { DetailedCompetitionResponse } from "@repo/logger";
import {
  Calendar,
  CheckSquare,
  Eye,
  MoreHorizontal,
  Users,
} from "lucide-react";

interface CompetitionGridProps {
  competitions: DetailedCompetitionResponse[];
}

export default function CompetitionGrid({
  competitions,
}: CompetitionGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {competitions.map((competition) => (
        <div
          key={competition.id}
          className="overflow-hidden rounded-xl bg-white shadow"
        >
          <div
            className={`h-2 ${
              competition.type === "LEAGUE"
                ? "bg-blue-500"
                : competition.type === "DUEL"
                  ? "bg-green-500"
                  : "bg-purple-500"
            }`}
          ></div>
          <div className="p-5">
            <div className="mb-3 flex items-start justify-between">
              <h3 className="text-lg font-semibold">{competition.name}</h3>
              <div className="flex items-center space-x-1">
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
                <button className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-xs text-gray-500">Teams</p>
                <p className="font-semibold">{competition.teams}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-xs text-gray-500">Players</p>
                <p className="font-semibold">{competition.players}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-xs text-gray-500">Matches</p>
                <p className="font-semibold">{competition.matches}</p>
              </div>
            </div>

            <div className="mb-4 space-y-2">
              {competition.votingEnabled && (
                <div className="flex items-center text-sm">
                  <CheckSquare size={16} className="mr-2 text-gray-500" />
                  <span className="text-gray-600">Voting Enabled</span>
                  {(competition.pendingVotes ?? 0) > 0 && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      {competition.pendingVotes} pending
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 rounded-lg bg-blue-50 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100">
                <Eye size={16} className="mr-1 inline" /> View
              </button>
              <button className="flex-1 rounded-lg bg-gray-50 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                <Calendar size={16} className="mr-1 inline" /> Matches
              </button>
              <button className="flex-1 rounded-lg bg-gray-50 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                <Users size={16} className="mr-1 inline" /> Teams
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
