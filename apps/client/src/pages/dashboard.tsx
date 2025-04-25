import { Trophy, Users, CheckSquare, Activity } from "lucide-react";
import DashboardBanner from "../components/features/dashboard/dashboard-banner";
import DashboardMatchList from "../components/features/dashboard/dashboard-match-list";
import DashboardStatCard from "../components/features/dashboard/dashboard-stat-card";
import DashboardCompetitionList from "../components/features/dashboard/dashboard-competition-list";
import { getTotalPlayersInDashboard } from "../utils/utils";
import { useDashboard } from "../hooks/use-dashboard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const {
    dashboardData,
    isLoading,
    dashboardMatches,
    dashboardCompetitions,
    pendingVotes,
    refreshData,
  } = useDashboard(user?.id || "");

  const navigate = useNavigate();

  const handleViewCompetitionDetails = (competitionId: string) => {
    navigate(`/competition/${competitionId}`);
  };

  const handleViewCalendar = () => {
    navigate("/matches");
  };

  const handleMatchClick = (matchId: string) => {
    navigate(`/match/${matchId}`);
  };

  const handleCreateClick = (userId: string) => {
    navigate(`/create-competition/${userId}`);
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
        <p className="text-accent" aria-live="polite">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <DashboardBanner
          name={user?.name}
          onCreateClick={() => user && handleCreateClick(user.id)}
          className="rounded-lg border-2 border-accent/70 bg-panel-bg shadow-md"
        />
      </div>

      <>
        <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 lg:gap-4 xl:grid-cols-4">
          <DashboardStatCard
            title="Active Competitions"
            value={dashboardData?.competitions.length || 0}
            icon={Trophy}
            iconClassName="bg-accent/20 text-accent"
            className="rounded-lg border-2 border-accent/60 bg-panel-bg p-4 shadow-md"
          />
          <DashboardStatCard
            title="Total Players"
            value={
              dashboardData ? getTotalPlayersInDashboard(dashboardData) : 0
            }
            icon={Users}
            iconClassName="bg-accent/20 text-accent"
            className="rounded-lg border-2 border-accent/60 bg-panel-bg p-4 shadow-md"
          />
          <DashboardStatCard
            title="Pending Votes"
            value={pendingVotes || 0}
            icon={CheckSquare}
            iconClassName="bg-accent/20 text-accent"
            className="rounded-lg border-2 border-accent/60 bg-panel-bg p-4 shadow-md"
          />
          <DashboardStatCard
            title="Completed Matches"
            value={
              dashboardCompetitions?.reduce(
                (total, comp) => total + comp.matches,
                0,
              ) || 0
            }
            icon={Activity}
            iconClassName="bg-accent/20 text-accent"
            className="rounded-lg border-2 border-accent/60 bg-panel-bg p-4 shadow-md"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 pb-6 lg:grid-cols-2">
          <div className="rounded-lg border-2 border-accent/70 bg-panel-bg shadow-lg">
            <DashboardCompetitionList
              competitions={dashboardCompetitions || []}
              onViewDetails={handleViewCompetitionDetails}
            />
          </div>
          <div className="rounded-lg border-2 border-accent/70 bg-panel-bg shadow-lg">
            <DashboardMatchList
              title="Latest Matches"
              matches={dashboardMatches || []}
              onViewCalendar={handleViewCalendar}
              onMatchClick={handleMatchClick}
            />
          </div>
        </div>
      </>
    </div>
  );
}
