import { DashboardCompetitionResponse } from "@repo/logger";
import DashboardCompetitionCard from "./dashboard-competition-card";

interface DashboardCompetitionListProps {
  competitions: DashboardCompetitionResponse[];
  onViewDetails?: (competitionId: string) => void;
}

export default function DashboardCompetitionList({
  competitions,
  onViewDetails,
}: DashboardCompetitionListProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold">Your Competitions</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
        {competitions.map((competition) => (
          <DashboardCompetitionCard
            key={competition.id}
            competition={competition}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
}
