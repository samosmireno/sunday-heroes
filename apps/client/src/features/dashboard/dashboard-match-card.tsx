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

  return (
    <div
      className="cursor-default rounded border-2 border-accent/50 bg-bg/30 p-3 transition-all hover:bg-bg/50"
      tabIndex={0}
      role="button"
    >
      <div className="relative mb-1 flex items-center justify-between">
        <span
          className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${bg} ${text}`}
        >
          {match.competitionType}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <CalendarDays className="h-3 w-3" />
          {formattedDate}
        </span>
      </div>
      <div className="mt-1">
        <h3 className="font-retro text-gray-200">
          {match.teams[0]} vs {match.teams[1]}
        </h3>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs uppercase text-gray-400">
            {match.competitionName}
          </p>
          <span className="font-bold text-accent">
            {match.homeTeamScore} : {match.awayTeamScore}
          </span>
        </div>
      </div>
    </div>
  );
}
