import { DashboardCompetitionResponse } from "@repo/logger";
import DashboardCompetitionCard from "./dashboard-competition-card";
import { Trophy } from "lucide-react";

interface DashboardCompetitionListProps {
  competitions: DashboardCompetitionResponse[];
  onViewDetails?: (competitionId: string) => void;
}

export default function DashboardCompetitionList({
  competitions,
  onViewDetails,
}: DashboardCompetitionListProps) {
  return (
    <div className="relative flex h-full flex-col">
      <div className="border-b-2 border-accent/70 bg-panel-bg px-4 py-3">
        <h2
          className="flex items-center text-xl font-bold uppercase tracking-wider text-accent"
          style={{ textShadow: "1px 1px 0 #000" }}
        >
          <Trophy className="mr-2 h-5 w-5" />
          Your Competitions
        </h2>
      </div>
      <div className="flex-1 overflow-hidden bg-bg/40">
        <div className="h-full overflow-y-auto p-4">
          {competitions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {competitions.map((competition) => (
                <DashboardCompetitionCard
                  key={competition.id}
                  competition={competition}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg bg-bg/20 p-4 text-center text-gray-400">
              No competitions found. Create your first competition to get
              started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
