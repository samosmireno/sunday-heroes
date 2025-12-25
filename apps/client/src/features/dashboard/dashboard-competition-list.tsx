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
    <div className="flex flex-col">
      <div className="border-b-2 border-accent/70 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2
            className="text-xl font-bold uppercase text-accent"
            style={{ textShadow: "1px 1px 0 #000" }}
          >
            Your Competitions
          </h2>

          <button
            className="text-sm font-bold text-accent hover:text-accent/80 hover:underline"
            onClick={() => navigate("/competitions")}
            aria-label="View all competitions"
          >
            View All
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-3 sm:p-4">
          {competitions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6">
              {displayedCompetitions.map((competition) => (
                <DashboardCompetitionCard
                  key={competition.id}
                  competition={competition}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg bg-bg/80 p-4 text-center sm:min-h-[250px] md:p-6">
              <div className="max-w-md">
                <p className="text-sm text-gray-400 sm:text-base lg:text-lg">
                  No competitions yet. Create one, or join via an invite from
                  another player.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
