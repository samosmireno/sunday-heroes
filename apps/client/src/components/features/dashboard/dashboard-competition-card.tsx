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
    <div
      key={competition.id}
      className="overflow-hidden rounded-xl bg-white shadow"
    >
      <div className={`h-2 ${typeColors[competition.type].bar}`}></div>
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="font-semibold">{competition.name}</h3>
          <span
            className={`rounded px-2 py-1 text-xs font-medium ${
              typeColors[competition.type].badge
            }`}
          >
            {competition.type}
          </span>
        </div>
        <div className="mb-3 flex justify-between text-sm text-gray-500">
          <span>{2} Teams</span>
          <span>{competition.matches} Matches</span>
        </div>

        <Button
          className="w-full rounded-lg bg-gray-100 py-2 text-sm text-gray-800 hover:bg-gray-200"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
