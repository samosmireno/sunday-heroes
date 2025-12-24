import { CompetitionType, DashboardMatchResponse } from "@repo/shared-types";
import { CalendarDays } from "lucide-react";

interface MatchCardProps {
  match: DashboardMatchResponse;
}

const matchTypeStyles: Record<CompetitionType, { bg: string; text: string }> = {
  LEAGUE: { bg: "bg-league-800/40", text: "text-league-300" },
  KNOCKOUT: { bg: "bg-knockout-800/40", text: "text-knockout-300" },
  DUEL: { bg: "bg-duel-800/40", text: "text-duel-300" },
};

export default function DashboardMatchCard({ match }: MatchCardProps) {
  const { bg, text } = matchTypeStyles[match.competitionType];
  const formattedDate = match.date
    ? new Date(match.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "TBD";

  const homeTeamWon = match.homeTeamScore > match.awayTeamScore;
  const awayTeamWon = match.homeTeamScore < match.awayTeamScore;

  return (
    <div className="rounded-lg border-2 border-accent/50 bg-panel-bg p-4">
      <div className="relative mb-2 flex items-center justify-between">
        <div className="space-x-4">
          <span className="text-xs uppercase text-gray-400">
            {match.competitionName}
          </span>
          <span
            className={`rounded px-2 py-1 text-xs font-bold uppercase ${bg} ${text}`}
          >
            {match.competitionType}
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <CalendarDays className="h-3 w-3" aria-hidden="true" />
          {formattedDate}
        </span>
      </div>
      <hr className="mb-2 border-accent/20" />
      <div className="flex flex-col gap-2">
        <h3 className="flex items-center justify-between font-retro text-gray-200">
          <span
            className={`transition-colors ${
              homeTeamWon ? "font-bold" : "text-gray-200"
            }`}
          >
            {match.teams[0]}
          </span>
          <span className="mx-2 text-lg font-extrabold text-accent">
            {match.homeTeamScore} : {match.awayTeamScore}
          </span>
          <span
            className={`transition-colors ${
              awayTeamWon ? "font-bold" : "text-gray-200"
            }`}
          >
            {match.teams[1]}
          </span>
        </h3>
      </div>
    </div>
  );
}
