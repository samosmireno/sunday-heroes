import { DashboardCompetitionResponse } from "@repo/shared-types";
import DashboardCompetitionCard from "./dashboard-competition-card";
import { useNavigate } from "react-router-dom";

interface DashboardCompetitionListProps {
  competitions: DashboardCompetitionResponse[];
  maxDisplay?: number;
}

export default function DashboardCompetitionList({
  competitions,
  maxDisplay = 6,
}: DashboardCompetitionListProps) {
  const navigate = useNavigate();
  const displayedCompetitions = competitions.slice(0, maxDisplay);
  return (
    <div className="relative flex h-full flex-col">
      <div className="flex items-center justify-between border-b-2 border-accent/70 bg-panel-bg px-4 py-3">
        <h2
          className="flex items-center text-xl font-bold uppercase tracking-wider text-accent"
          style={{ textShadow: "1px 1px 0 #000" }}
        >
          Your Competitions
        </h2>
        <button
          className="text-sm font-bold text-accent hover:text-accent/80"
          onClick={() => {
            navigate("/competitions");
          }}
          aria-label="View all competitions"
        >
          View All
        </button>
      </div>
      <div className="flex-1 overflow-hidden bg-bg/40">
        <div className="h-full overflow-y-auto p-4">
          {competitions.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {displayedCompetitions.map((competition) => (
                <DashboardCompetitionCard
                  key={competition.id}
                  competition={competition}
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
