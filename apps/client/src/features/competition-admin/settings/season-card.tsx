import { CompetitionSettings } from "@repo/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { currentSeasonLabel } from "./season-label";
import {
  START_NEW_SEASON_HELPER,
  startNewSeasonCardCopy,
  startNewSeasonDialogCopy,
} from "./season-copy";
import { useStartNewSeason } from "./use-competition-mutations";

interface SeasonCardProps {
  competition: CompetitionSettings;
}

export default function SeasonCard({ competition }: SeasonCardProps) {
  const { currentSeason } = competition;
  const startNewSeason = useStartNewSeason(competition.id, competition.type);
  const dialog = startNewSeasonDialogCopy(competition);

  const handleConfirm = async () => {
    await startNewSeason.mutateAsync();
  };

  return (
    <Card className="border-2 border-accent/50 bg-panel-bg">
      <CardHeader>
        <CardTitle className="text-accent">Season</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-200">
          {currentSeasonLabel(currentSeason)}
        </p>

        <div className="border-t border-accent/30 pt-4">
          <p className="mb-3 text-sm text-gray-300">
            {startNewSeasonCardCopy(competition)}
          </p>
          {currentSeason.matchCount === 0 ? (
            <div className="space-y-2">
              <Button
                size="sm"
                disabled
                className="bg-orange-900/30 text-orange-400"
              >
                Start new season
              </Button>
              <p className="text-xs text-gray-400">{START_NEW_SEASON_HELPER}</p>
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
              triggerContent="Start new season"
              confirmText={dialog.confirmText}
              onConfirm={handleConfirm}
              variant="warning"
              icon="archive"
              loadingText={dialog.loadingText}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
