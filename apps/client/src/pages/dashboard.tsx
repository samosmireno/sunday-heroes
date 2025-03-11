import { Trophy, Users, CheckSquare, Activity } from "lucide-react";
import DashboardBanner from "../components/features/dashboard/dashboard-banner";
import DashboardMatchList from "../components/features/dashboard/dashboard-match-list";
import DashboardStatCard from "../components/features/dashboard/dashboard-stat-card";
import DashboardCompetitionList from "../components/features/dashboard/dashboard-competition-list";
import { AppSidebar } from "../components/features/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { getTotalPlayersInDashboard } from "../utils/utils";
import { useDashboard } from "../hooks/use-dashboard";
import { useNavigate } from "react-router-dom";

const dashboardId = "3cc0bd55-c60d-47c3-8039-90e747f953e9";

export default function Dashboard() {
  const {
    dashboardData,
    isLoading,
    dashboardMatches,
    dashboardCompetitions,
    pendingVotes,
  } = useDashboard(dashboardId);

  const navigate = useNavigate();

  const handleViewCompetitionDetails = (competitionId: string) => {
    console.log(`View details for competition ${competitionId}`);
    navigate(`/competition/${competitionId}`);
  };

  const handleViewCalendar = () => {
    console.log("View calendar clicked");
  };

  const handleMatchClick = (matchId: string) => {
    console.log(`Match ${matchId} clicked`);
  };

  const handleCreateClick = (dashboardId: string) => {
    console.log(`Creating competition for dash=${dashboardId}`);
    navigate(`/create-competition?dashboardId=${dashboardId}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full p-6">
        <div className="flex flex-row">
          <SidebarTrigger />
          <h1 className="flex-grow pb-6 text-center font-oswald text-3xl font-semibold">
            SUNDAY HEROES
          </h1>
        </div>
        <DashboardBanner
          onCreateClick={() =>
            handleCreateClick("3cc0bd55-c60d-47c3-8039-90e747f953e9")
          }
        />
        {dashboardData && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DashboardStatCard
                title="Active Competitions"
                value={dashboardData?.competitions.length}
                icon={Trophy}
                iconColor="green"
              />
              <DashboardStatCard
                title="Total Players"
                value={getTotalPlayersInDashboard(dashboardData)}
                icon={Users}
                iconColor="red"
              />
              <DashboardStatCard
                title="Pending Votes"
                value={pendingVotes}
                icon={CheckSquare}
                iconColor="gray"
              />{" "}
              <DashboardStatCard
                title="Completed Matches"
                value={
                  dashboardCompetitions?.reduce(
                    (total, comp) => total + comp.matches,
                    0,
                  ) || 0
                }
                icon={Activity}
                iconColor="violet"
              />
            </div>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <DashboardCompetitionList
                competitions={dashboardCompetitions || []}
                onViewDetails={handleViewCompetitionDetails}
              />
              <DashboardMatchList
                title="Latest Matches"
                matches={dashboardMatches || []}
                onViewCalendar={handleViewCalendar}
                onMatchClick={handleMatchClick}
              />
            </div>
          </>
        )}
      </div>
    </SidebarProvider>
  );
}
