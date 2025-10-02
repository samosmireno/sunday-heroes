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
      <div className="flex flex-col gap-2 rounded-t-xl border-b-2 border-accent/70 bg-panel-bg px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-4 md:px-5 lg:px-6">
        <h2
          className="flex items-center text-lg font-bold uppercase tracking-wider text-accent sm:text-xl"
          style={{ textShadow: "1px 1px 0 #000" }}
        >
          Your Competitions
        </h2>
        <button
          className="self-start text-xs font-bold text-accent transition-colors duration-200 hover:text-accent/80 sm:self-auto sm:text-sm"
          onClick={() => {
            navigate("/competitions");
          }}
          aria-label="View all competitions"
        >
          View All
        </button>
      </div>

      <div className="flex-1 overflow-hidden bg-bg/40">
        <div className="h-full overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6">
          {competitions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
              {displayedCompetitions.map((competition) => (
                <DashboardCompetitionCard
                  key={competition.id}
                  competition={competition}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg bg-bg/20 p-4 text-center sm:min-h-[250px] md:p-6">
              <div className="max-w-md">
                <p className="text-sm text-gray-400 sm:text-base lg:text-lg">
                  No competitions found. Create your first competition to get
                  started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
