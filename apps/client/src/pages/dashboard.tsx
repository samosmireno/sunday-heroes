import { Trophy, Users, CheckSquare, Activity } from "lucide-react";
import DashboardBanner from "../components/features/dashboard/dashboard-banner";
import DashboardMatchList from "../components/features/dashboard/dashboard-match-list";
import DashboardStatCard from "../components/features/dashboard/dashboard-stat-card";
import DashboardCompetitionList from "../components/features/dashboard/dashboard-competition-list";
import { useDashboard } from "../hooks/use-dashboard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import Loading from "../components/ui/loading";

export default function Dashboard() {
  const { user } = useAuth();
  const { dashboardData, isLoading, dashboardMatches, dashboardCompetitions } =
    useDashboard(user?.id || "");

  const navigate = useNavigate();

  if (isLoading) {
    return <Loading text="Loading dashboard..." />;
  }

  return (
    <div className="relative flex flex-1 flex-col p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <DashboardBanner
          name={user?.name}
          onCreateClick={() =>
            user && navigate(`/create-competition/${user.id}`)
          }
          className="rounded-lg border-2 border-accent/70 bg-panel-bg shadow-md"
        />
      </div>

      <>
        <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 lg:gap-4 xl:grid-cols-4">
          <DashboardStatCard
            title="Active Competitions"
            value={dashboardData?.activeCompetitions || 0}
            icon={Trophy}
            iconClassName="bg-accent/20 text-accent"
            className="rounded-lg border-2 border-accent/60 bg-panel-bg p-4 shadow-md"
          />
          <DashboardStatCard
            title="Total Players"
            value={dashboardData?.totalPlayers || 0}
            icon={Users}
            iconClassName="bg-accent/20 text-accent"
            className="rounded-lg border-2 border-accent/60 bg-panel-bg p-4 shadow-md"
          />
          <DashboardStatCard
            title="Pending Votes"
            value={dashboardData?.pendingVotes || 0}
            icon={CheckSquare}
            iconClassName="bg-accent/20 text-accent"
            className="rounded-lg border-2 border-accent/60 bg-panel-bg p-4 shadow-md"
          />
          <DashboardStatCard
            title="Completed Matches"
            value={dashboardData?.completedMatches || 0}
            icon={Activity}
            iconClassName="bg-accent/20 text-accent"
            className="rounded-lg border-2 border-accent/60 bg-panel-bg p-4 shadow-md"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 pb-6 lg:grid-cols-2">
          <div className="rounded-lg border-2 border-accent/70 bg-panel-bg shadow-lg">
            <DashboardCompetitionList
              competitions={dashboardCompetitions || []}
            />
          </div>
          <div className="rounded-lg border-2 border-accent/70 bg-panel-bg shadow-lg">
            <DashboardMatchList
              title="Latest Matches"
              matches={dashboardMatches || []}
            />
          </div>
        </div>
      </>
    </div>
  );
}
