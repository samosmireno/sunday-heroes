import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCompetition } from "../hooks/use-competition";
import { useAuth } from "../context/auth-context";
import Header from "../components/ui/header";
import Loading from "../components/ui/loading";
import ErrorPage from "./error-page";
import { Button } from "../components/ui/button";
import { UserPlus, AlertTriangle } from "lucide-react";
import ModeratorsList from "../components/features/competition-admin/moderators-list";
import CompetitionSettings from "../components/features/competition-admin/competition-settings";
import AddModeratorModal from "../components/features/competition-admin/add-moderator-modal";

const tabs = [
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
  const [activeTab, setActiveTab] = useState<"moderators" | "settings">(
    "moderators",
  );

  if (isLoading) {
    return <Loading text="Loading competition admin..." />;
  }

  if (!competition || !competitionId) {
    return <ErrorPage />;
  }

  if (!competition.isAdmin) {
    return (
      <div className="relative mx-auto flex h-screen max-w-md flex-col items-center justify-center p-4">
        <div className="rounded-lg border-2 border-red-500 bg-panel-bg p-6 text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="mb-4 text-xl font-bold text-red-500">Access Denied</h2>
          <p className="text-gray-200">
            You don't have admin privileges for this competition.
          </p>
          <Button
            onClick={() => navigate(`/competition/${competitionId}`)}
            className="mt-4 bg-accent/20 text-accent hover:bg-accent/30"
          >
            Back to Competition
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <Header title={`Admin: ${competition.name}`} hasSidebar={true} />
      <div className="relative mb-6">
        <div className="flex space-x-1 rounded-lg bg-bg/70 p-1">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-accent/20 text-accent"
                  : "text-gray-400 hover:bg-bg/50 hover:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "moderators" && (
        <div className="relative space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-200">
              Competition Moderators
            </h3>
            <Button
              onClick={() => setIsAddModeratorModalOpen(true)}
              className="bg-accent/40 text-accent hover:bg-accent/30"
            >
              <UserPlus size={16} className="mr-2" />
              Add Moderator
            </Button>
          </div>
          <ModeratorsList
            moderators={competition.moderators || []}
            onUpdate={refetch}
          />
        </div>
      )}

      {activeTab === "settings" && (
        <CompetitionSettings competition={competition} />
      )}

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
