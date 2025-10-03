import { CompetitionResponse } from "@repo/shared-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  useDeleteCompetition,
  useResetCompetition,
} from "./use-competition-mutations";

interface CompetitionSettingsProps {
  competition: CompetitionResponse;
}

export default function CompetitionSettings({
  competition,
}: CompetitionSettingsProps) {
  const resetMutation = useResetCompetition(competition.id);
  const deleteMutation = useDeleteCompetition(competition.id);

  const handleReset = async () => {
    resetMutation.mutate();
  };

  const handleDelete = async () => {
    deleteMutation.mutate();
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
                onConfirm={handleReset}
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
                onConfirm={handleDelete}
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
