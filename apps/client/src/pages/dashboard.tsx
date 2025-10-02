import { Trophy, Users, CheckSquare, Activity } from "lucide-react";
import DashboardBanner from "@/features/dashboard/dashboard-banner";
import DashboardMatchList from "@/features/dashboard/dashboard-match-list";
import DashboardStatCard from "@/features/dashboard/dashboard-stat-card";
import DashboardCompetitionList from "@/features/dashboard/dashboard-competition-list";
import { useDashboard } from "@/features/dashboard/use-dashboard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import DashboardSkeleton from "@/features/dashboard/dashboard-skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const { dashboard, isLoading } = useDashboard(user?.id || "");

  const navigate = useNavigate();

  if (isLoading) {
    return <DashboardSkeleton />;
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
            value={dashboard?.activeCompetitions || 0}
            icon={Trophy}
          />
          <DashboardStatCard
            title="Total Players"
            value={dashboard?.totalPlayers || 0}
            icon={Users}
          />
          <DashboardStatCard
            title="Pending Votes"
            value={dashboard?.pendingVotes || 0}
            icon={CheckSquare}
          />
          <DashboardStatCard
            title="Completed Matches"
            value={dashboard?.completedMatches || 0}
            icon={Activity}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 pb-6 lg:grid-cols-2">
          <div className="rounded-lg border-2 border-accent/70 bg-panel-bg shadow-lg">
            <DashboardCompetitionList
              competitions={dashboard?.competitions || []}
            />
          </div>
          <div className="rounded-lg border-2 border-accent/70 bg-panel-bg shadow-lg">
            <DashboardMatchList
              title="Latest Matches"
              matches={dashboard?.matches || []}
            />
          </div>
        </div>
      </>
    </div>
  );
}
