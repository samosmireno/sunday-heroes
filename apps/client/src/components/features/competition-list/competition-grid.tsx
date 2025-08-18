import { DetailedCompetitionResponse, Role } from "@repo/shared-types";
import {
  Calendar,
  CheckSquare,
  Shield,
  Trophy,
  Users,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";

interface CompetitionGridProps {
  competitions: DetailedCompetitionResponse[];
}

export default function CompetitionGrid({
  competitions,
}: CompetitionGridProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {competitions.map((competition) => (
        <div
          key={competition.id}
          className="overflow-hidden rounded-lg border-2 border-t-0 border-accent/70 bg-panel-bg shadow-md transition-all hover:shadow-lg"
        >
          <div
            className={`h-1.5 sm:h-2 ${
              competition.type === "LEAGUE"
                ? "bg-league-500"
                : competition.type === "DUEL"
                  ? "bg-duel-500"
                  : "bg-knockout-500"
            }`}
          ></div>
          <div className="p-3 sm:p-4">
            <div className="mb-2 flex items-start justify-between sm:mb-3">
              <div className="flex items-center gap-1.5">
                <h3
                  className="truncate text-sm font-bold text-gray-200 sm:text-base"
                  title={competition.name}
                >
                  {competition.name}
                </h3>
                {competition.userRole === Role.ADMIN && (
                  <Shield size={16} className="flex-shrink-0 text-amber-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {competition.userRole === Role.ADMIN && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/competition/${competition.id}/admin`);
                    }}
                    className="rounded-md bg-amber-900/30 p-1.5 text-amber-400 transition-all hover:scale-105 hover:bg-amber-900/50"
                    title="Admin Panel"
                  >
                    <Settings size={14} />
                  </button>
                )}
                <span
                  className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                    competition.type === "LEAGUE"
                      ? "bg-league-800/40 text-league-300"
                      : competition.type === "DUEL"
                        ? "bg-duel-800/40 text-duel-300"
                        : "bg-knockout-800/40 text-knockout-300"
                  }`}
                >
                  {competition.type}
                </span>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-1 text-center sm:mb-4 sm:gap-2">
              <div className="rounded-lg bg-bg/30 p-1.5 sm:p-2">
                <p className="text-3xs text-gray-400 sm:text-xs">Teams</p>
                <p className="text-xs font-bold text-accent sm:text-sm">
                  {competition.teams}
                </p>
              </div>
              <div className="rounded-lg bg-bg/30 p-1.5 sm:p-2">
                <p className="text-3xs text-gray-400 sm:text-xs">Players</p>
                <p className="text-xs font-bold text-accent sm:text-sm">
                  {competition.players}
                </p>
              </div>
              <div className="rounded-lg bg-bg/30 p-1.5 sm:p-2">
                <p className="text-3xs text-gray-400 sm:text-xs">Matches</p>
                <p className="text-xs font-bold text-accent sm:text-sm">
                  {competition.matches}
                </p>
              </div>
            </div>

            <div
              className={`flex gap-1 sm:gap-2 ${competition.userRole === Role.ADMIN ? "flex-wrap" : ""}`}
            >
              <Button
                onClick={() => navigate(`/competition/${competition.id}`)}
                className="text-3xs flex-1 rounded-lg border-2 border-accent/40 bg-bg/30 px-2 py-1.5 font-bold text-gray-300 transition-all hover:bg-accent/10 sm:px-3 sm:py-2 sm:text-xs"
              >
                <Trophy size={14} className="mr-1 inline" /> View
              </Button>
              <Button
                onClick={() => navigate(`/matches/${competition.id}`)}
                className="text-3xs flex-1 rounded-lg border-2 border-accent/40 bg-bg/30 px-2 py-1.5 font-bold text-gray-300 transition-all hover:bg-accent/10 sm:px-3 sm:py-2 sm:text-xs"
              >
                <Calendar size={14} className="mr-1 inline" /> Matches
              </Button>
              {/* <button
                onClick={() => navigate(`/competition/${competition.id}/teams`)}
                className="text-3xs flex-1 rounded-lg border-2 border-accent/40 bg-bg/30 px-2 py-1.5 font-bold text-gray-300 transition-all hover:bg-accent/10 sm:px-3 sm:py-2 sm:text-xs"
              >
                <Users size={14} className="mr-1 inline" /> Teams
              </button> */}
            </div>

            {competition.votingEnabled && (
              <div className="mt-3 flex items-center text-xs sm:mt-4">
                <CheckSquare size={14} className="mr-1.5 text-amber-500" />
                <span className="text-gray-300">Voting Enabled</span>
                {(competition.pendingVotes ?? 0) > 0 && (
                  <span className="text-3xs ml-1.5 rounded-full bg-amber-900/30 px-1.5 py-0.5 text-amber-400 sm:text-xs">
                    {competition.pendingVotes} pending
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
