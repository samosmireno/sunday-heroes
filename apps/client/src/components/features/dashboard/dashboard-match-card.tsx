import { CompetitionType, DashboardMatchResponse } from "@repo/logger";
import { convertMatchType } from "../../../types/types";

interface MatchCardProps {
  match: DashboardMatchResponse;
  venue: string;
  onClick?: () => void;
}

const matchTypeStyles: Record<CompetitionType, { bg: string; text: string }> = {
  LEAGUE: { bg: "bg-green-100", text: "text-green-700" },
  KNOCKOUT: { bg: "bg-purple-100", text: "text-purple-700" },
  DUEL: { bg: "bg-blue-100", text: "text-blue-700" },
};

export default function DashboardMatchCard({
  match,
  venue,
  onClick,
}: MatchCardProps) {
  console.log("match", match);
  const { bg, text } = matchTypeStyles[match.competition_type];

  return (
    <div
      className="cursor-pointer rounded-lg border-2 border-gray-100 p-3 transition-colors hover:border-gray-200"
      onClick={onClick}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className={`rounded px-2 py-1 text-xs font-medium ${bg} ${text}`}>
          {match.competition_type}
        </span>
        <span className="text-xs text-gray-500">{match.date}</span>
      </div>
      <h3 className="font-medium">
        {match.teams[0]} vs {match.teams[1]}{" "}
        {`${match.home_team_score} : ${match.away_team_score}`}
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {convertMatchType(match.match_type)} • {venue}
      </p>
    </div>
  );
}
