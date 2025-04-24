import { DashboardCompetitionResponse } from "@repo/logger";
import { Button } from "../../ui/button";

interface DashboardCompetitionCardProps {
  competition: DashboardCompetitionResponse;
  onViewDetails?: (competitionId: string) => void;
}

export default function DashboardCompetitionCard({
  competition,
  onViewDetails,
}: DashboardCompetitionCardProps) {
  const typeColors = {
    DUEL: {
      bar: "bg-blue-500",
      badge: "bg-blue-100 text-blue-700",
    },
    LEAGUE: {
      bar: "bg-green-500",
      badge: "bg-green-100 text-green-700",
    },
    KNOCKOUT: {
      bar: "bg-purple-500",
      badge: "bg-purple-100 text-purple-700",
    },
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(competition.id);
    }
  };

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
          onClick={handleViewDetails}
          className="w-full rounded bg-accent/20 px-4 py-2 text-sm font-bold text-accent transition-colors hover:bg-accent/30"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
