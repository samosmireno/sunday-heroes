import {
  Trophy,
  Users,
  CheckSquare,
  Activity,
  AlertTriangle,
  Info,
} from "lucide-react";
import DashboardBanner from "@/features/dashboard/dashboard-banner";
import DashboardMatchList from "@/features/dashboard/dashboard-match-list";
import DashboardStatCard from "@/features/dashboard/dashboard-stat-card";
import DashboardCompetitionList from "@/features/dashboard/dashboard-competition-list";
import { useDashboard } from "@/features/dashboard/use-dashboard";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import DashboardSkeleton from "@/features/dashboard/dashboard-skeleton";
import { UserResponse } from "@repo/shared-types";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth() as { user: UserResponse };
  const { dashboard, isLoading } = useDashboard(user.id);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state ?? {};
    if (state.showSuccessToast) {
      if (state.invitedBy) {
        toast.success(
          `You're ${state.registered ? "registered and" : ""} successfully connected to player on ${state.invitedBy}'s Dashboard. You'll see matches and stats once games are added.`,
        );
      } else if (state.registered) {
        toast.success(
          "Welcome to Sunday Heroes! Create a competition to start tracking matches and player stats.",
        );
      }
      navigate(location.pathname, {
        replace: true,
        state: { ...state, showSuccessToast: false },
      });
    }
  }, [location, navigate]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="relative flex flex-1 flex-col p-4 sm:p-6">
      <DashboardBanner
        name={user?.name}
        onCreateClick={() => user && navigate(`/create-competition/${user.id}`)}
        className="mb-6 rounded-lg border-2 border-accent/70 bg-panel-bg shadow-md sm:mb-8"
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
        <DashboardStatCard
          title="Total Competitions"
          value={dashboard?.activeCompetitions || 0}
          icon={Trophy}
          info={
            dashboard?.activeCompetitions
              ? `You're involved in ${dashboard.activeCompetitions} active competition${dashboard.activeCompetitions > 1 ? "s" : ""}.`
              : "No active competitions yet. Create or join one to get started."
          }
        />
        <DashboardStatCard
          title="Total Players"
          value={dashboard?.totalPlayers || 0}
          icon={Users}
          info={
            dashboard?.totalPlayers
              ? `Tracking stats for ${dashboard.totalPlayers} player${dashboard.totalPlayers > 1 ? "s" : ""} across your competitions.`
              : "No players yet. Players will appear once matches are added."
          }
        />
        {dashboard?.votingEnabled ? (
          <DashboardStatCard
            title="Pending Votes"
            value={dashboard?.pendingVotes || 0}
            icon={
              (dashboard?.pendingVotes ?? 0) > 0 ? AlertTriangle : CheckSquare
            }
            info={
              dashboard?.pendingVotes
                ? `${dashboard.pendingVotes} player${dashboard.pendingVotes > 1 ? "s have" : " has"} yet to vote in recent matches.`
                : "All votes are in for your recent matches."
            }
            type="alert"
          />
        ) : (
          <DashboardStatCard
            title="Match Voting"
            value={dashboard?.pendingVotes || 0}
            icon={Info}
            info={
              "Enable voting in competitions to let players vote for top performers."
            }
          />
        )}
        <DashboardStatCard
          title="Completed Matches"
          value={dashboard?.completedMatches || 0}
          icon={Activity}
          info={
            dashboard?.completedMatches
              ? `${dashboard.completedMatches} match${dashboard.completedMatches > 1 ? "es" : ""} finalized.`
              : "No matches completed yet. Play and finalize matches to see stats."
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 pb-6 lg:grid-cols-2">
        <DashboardCompetitionList
          competitions={dashboard?.competitions || []}
        />
        <DashboardMatchList matches={dashboard?.matches || []} />
      </div>
    </div>
  );
}
