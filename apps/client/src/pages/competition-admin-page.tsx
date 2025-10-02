import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCompetition } from "@/features/competition/use-competition";
import { useAuth } from "@/context/auth-context";
import Header from "@/components/ui/header";
import ErrorPage from "./error-page";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowLeft } from "lucide-react";
import ModeratorsList from "@/features/competition-admin/moderators-list";
import CompetitionSettings from "@/features/competition-admin/competition-settings";
import AddModeratorModal from "@/features/competition-admin/add-moderator-modal";
import { Role } from "@repo/shared-types";
import CompetitionAdminPageSkeleton from "@/features/competition-admin/competition-admin-page-skeleton";
import { AccessDenied } from "@/features/competition-admin/access-denied";

type TabType = "moderators" | "settings";

const tabs: { id: TabType; label: string }[] = [
  { id: "moderators", label: "Moderators" },
  { id: "settings", label: "Settings" },
];

export default function CompetitionAdminPage() {
  const { user } = useAuth();
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const { competition, isLoading, refetch } = useCompetition(
    competitionId ?? "",
    user?.id || "",
  );

  const [isAddModeratorModalOpen, setIsAddModeratorModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("moderators");

  if (isLoading) {
    return <CompetitionAdminPageSkeleton />;
  }

  if (!competition || !competitionId) {
    return <ErrorPage />;
  }

  if (competition.userRole !== Role.ADMIN) {
    return (
      <AccessDenied
        onNavigate={() => navigate(`/competition/${competitionId}`)}
      />
    );
  }

  return (
    <div className="relative flex-1 p-3 sm:p-4 md:p-5 lg:p-6">
      <Header title={`Admin: ${competition.name}`} hasSidebar={true} />

      <div className="relative mb-4 w-full sm:mb-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex justify-between overflow-x-auto rounded-lg bg-bg/70 p-1">
            {tabs.map(({ id, label }) => (
              <Button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex min-w-0 flex-shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                  activeTab === id
                    ? "bg-accent/20 text-accent"
                    : "text-gray-400 hover:bg-bg/50 hover:text-gray-300"
                }`}
              >
                {label}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => navigate(`/competition/${competitionId}`)}
            className="ml-2 rounded-md bg-accent/20 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/30 sm:px-4 sm:text-sm"
            title="Back to Competition"
          >
            <ArrowLeft />
          </Button>
        </div>
      </div>

      <div className="relative rounded-lg border-2 border-accent bg-panel-bg p-3 shadow-lg sm:p-4 md:p-5 lg:p-6">
        {activeTab === "moderators" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <h3 className="text-base font-semibold text-accent sm:text-lg">
                Manage Moderators
              </h3>
              <Button
                onClick={() => setIsAddModeratorModalOpen(true)}
                className="w-full bg-accent/40 text-accent hover:bg-accent/30 sm:w-auto"
              >
                <UserPlus size={14} className="mr-2 sm:size-4" />
                <span className="text-sm sm:text-base">Add Moderator</span>
              </Button>
            </div>
            <ModeratorsList
              moderators={competition.moderators || []}
              onUpdate={refetch}
            />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-base font-semibold text-accent sm:text-lg">
              Competition Settings
            </h3>
            <CompetitionSettings competition={competition} />
          </div>
        )}
      </div>

      <AddModeratorModal
        isOpen={isAddModeratorModalOpen}
        onOpenChange={() =>
          setIsAddModeratorModalOpen(!isAddModeratorModalOpen)
        }
        competitionId={competitionId}
        onSuccess={() => {
          setIsAddModeratorModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
