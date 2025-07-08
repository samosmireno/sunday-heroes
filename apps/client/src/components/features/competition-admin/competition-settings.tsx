import { CompetitionResponse } from "@repo/shared-types";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import ConfirmationDialog from "../../ui/confirmation-dialog";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../config/axiosConfig";
import { config } from "../../../config/config";

interface CompetitionSettingsProps {
  competition: CompetitionResponse;
  onUpdate?: () => void;
}

export default function CompetitionSettings({
  competition,
  onUpdate,
}: CompetitionSettingsProps) {
  const navigate = useNavigate();

  const handleResetCompetition = async () => {
    await axiosInstance.put(
      `${config.server}/api/competitions/${competition.id}/reset`,
      { withCredentials: true },
    );
    onUpdate?.();
  };

  const handleDeleteCompetition = async () => {
    await axiosInstance.delete(
      `${config.server}/api/competitions/${competition.id}`,
      { withCredentials: true },
    );
    navigate("/competitions");
  };

  return (
    <div className="relative space-y-6">
      <Card className="border-2 border-red-500/50 bg-panel-bg">
        <CardHeader>
          <CardTitle className="text-red-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-t border-red-500/30 pt-4">
              <p className="mb-3 text-sm text-gray-300">
                Remove all matches and reset statistics while keeping teams and
                settings.
              </p>
              <ConfirmationDialog
                title="Reset Competition"
                description={
                  <div className="space-y-3">
                    <p className="text-gray-200">
                      Are you sure you want to reset "{competition.name}"?
                    </p>
                  </div>
                }
                triggerContent="Reset Competition"
                confirmText="Reset Competition"
                onConfirm={handleResetCompetition}
                variant="warning"
                icon="reset"
                loadingText="Resetting..."
              />
            </div>

            <div className="border-t border-red-500/30 pt-4">
              <p className="mb-3 text-sm text-gray-300">
                Delete this competition permanently. This action cannot be
                undone and will remove all associated data including matches,
                results, and statistics.
              </p>
              <ConfirmationDialog
                title="Delete Competition"
                description={
                  <div className="space-y-3">
                    <p className="text-gray-200">
                      This action cannot be undone. This will permanently delete
                      the competition
                      <span className="font-semibold text-accent">
                        {" "}
                        "{competition.name}"
                      </span>{" "}
                      and remove all associated data including:
                    </p>

                    <ul className="ml-4 list-inside list-disc space-y-1 text-sm text-gray-300">
                      <li>All matches and results</li>
                      <li>Player statistics</li>
                      <li>Team information</li>
                      <li>Voting data (if enabled)</li>
                      <li>Competition history</li>
                    </ul>
                  </div>
                }
                triggerContent="Delete Competition"
                confirmText="Delete Competition"
                onConfirm={handleDeleteCompetition}
                variant="destructive"
                icon="trash"
                loadingText="Deleting..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
