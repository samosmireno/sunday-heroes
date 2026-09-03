import { CompetitionSettings } from "@repo/shared-types";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  RESET_HELPER,
  resetCompetitionCardCopy,
  resetCompetitionDialogCopy,
  resetCounts,
} from "./reset-copy";
import { useResetCompetition } from "./use-competition-mutations";

interface ResetCompetitionProps {
  competition: CompetitionSettings;
}

/** The Danger Zone's Reset competition: its paragraph, disabled state and dialog. */
export default function ResetCompetition({
  competition,
}: ResetCompetitionProps) {
  const resetCompetition = useResetCompetition(competition);
  const dialog = resetCompetitionDialogCopy(competition);
  const { matches } = resetCounts(competition);

  const handleConfirm = async () => {
    await resetCompetition.mutateAsync();
  };

  return (
    <div className="border-t border-red-500/30 pt-4">
      <p className="mb-3 text-sm text-gray-300">
        {resetCompetitionCardCopy(competition)}
      </p>
      {matches === 0 ? (
        <div className="space-y-2">
          <Button size="sm" disabled className="bg-red-900/30 text-red-400">
            Reset competition
          </Button>
          <p className="text-xs text-gray-400">{RESET_HELPER}</p>
        </div>
      ) : (
        <ConfirmationDialog
          title={dialog.title}
          description={
            <div className="space-y-3">
              <p className="text-gray-200">{dialog.intro}</p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm text-gray-300">
                {dialog.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          }
          triggerContent="Reset competition"
          confirmText={dialog.confirmText}
          onConfirm={handleConfirm}
          variant="destructive"
          icon="reset"
          loadingText={dialog.loadingText}
        />
      )}
    </div>
  );
}
