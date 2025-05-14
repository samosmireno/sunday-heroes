import { DashboardCompetitionResponse } from "@repo/logger";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";

interface DashboardCompetitionCardProps {
  competition: DashboardCompetitionResponse;
}

export default function DashboardCompetitionCard({
  competition,
}: DashboardCompetitionCardProps) {
  const typeColors = {
    DUEL: {
      bar: "bg-duel-600",
      badge: "bg-duel-800/40 text-duel-300",
    },
    LEAGUE: {
      bar: "bg-league-600",
      badge: "bg-league-800/40 text-league-300",
    },
    KNOCKOUT: {
      bar: "bg-knockout-600",
      badge: "bg-knockout-800/40 text-knockout-300",
    },
  };

  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded border-2 border-accent/70 bg-panel-bg shadow-md transition-all hover:shadow-lg">
      <div className="flex items-center justify-between p-3">
        <h3
          className="truncate font-bold text-gray-200"
          title={competition.name}
        >
          {competition.name}
        </h3>
        <span
          className={`ml-2 flex-shrink-0 rounded px-2 py-1 text-xs font-bold ${
            typeColors[competition.type].badge
          }`}
        >
          {competition.type}
        </span>
      </div>

      <div className="border-t border-accent/30 px-3 py-2 text-sm text-gray-400">
        <span>Matches: {competition.matches}</span>
      </div>

      <div className="border-t border-accent/30 p-2">
        <Button
          onClick={() => navigate(`/competition/${competition.id}`)}
          className="w-full rounded bg-accent/20 px-4 py-2 text-sm font-bold text-accent transition-colors hover:bg-accent/30"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
