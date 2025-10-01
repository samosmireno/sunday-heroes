import { Medal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VotePlayer {
  id: string;
  nickname: string;
  isHome: boolean;
  canVoteFor: boolean;
}

interface SelectedPlayer {
  id: string;
  rank: number;
}

interface PlayerSelectionProps {
  selectedPlayers: SelectedPlayer[];
  players: VotePlayer[];
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  maxSelections: number;
  showSubmitButton: boolean;
}

const PlayerSelection = ({
  selectedPlayers,
  players,
  onSubmit,
  isSubmitting = false,
  maxSelections = 3,
  showSubmitButton = true,
}: PlayerSelectionProps) => {
  const getPlayerInfo = (playerId: string) => {
    return players.find((p) => p.id === playerId);
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 3:
        return "text-yellow-400"; // Gold
      case 2:
        return "text-gray-300"; // Silver
      case 1:
        return "text-amber-700"; // Bronze
      default:
        return "text-gray-400"; // Fallback
    }
  };

  return (
    <div className="rounded-lg border-2 border-accent/70 bg-panel-bg p-5 shadow-lg">
      <h2 className="mb-3 border-b border-accent/30 pb-2 text-xl font-bold text-accent">
        Your selection ({selectedPlayers.length}/{maxSelections})
      </h2>

      <div className="space-y-3">
        {selectedPlayers.length > 0 ? (
          selectedPlayers
            .sort((a, b) => b.rank - a.rank)
            .map((p) => {
              const player = getPlayerInfo(p.id);
              if (!player) return null;

              return (
                <div
                  key={p.rank}
                  className="flex items-center justify-between rounded-lg border-2 border-accent/50 bg-bg/40 p-3"
                >
                  <div className="flex items-center">
                    <Medal
                      className={`mr-2 h-5 w-5 ${getMedalColor(p.rank)}`}
                    />
                    <span className="font-medium text-gray-200">
                      {player.nickname}
                    </span>
                  </div>
                  <span className="rounded bg-accent/30 px-2 py-1 text-xs font-bold text-accent">
                    {p.rank} points
                  </span>
                </div>
              );
            })
        ) : (
          <div className="rounded-lg border-2 border-accent/30 bg-bg/20 p-4 text-center text-gray-400">
            No players selected yet
          </div>
        )}

        {showSubmitButton && selectedPlayers.length === maxSelections && (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="mt-4 w-full transform bg-accent text-bg transition-all hover:bg-accent/80"
          >
            {isSubmitting ? "Submitting..." : "Submit Votes"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlayerSelection;
