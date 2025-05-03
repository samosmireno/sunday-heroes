import { CheckCircle2 } from "lucide-react";
import { Button } from "../../ui/button";

interface VotePlayer {
  id: string;
  nickname: string;
  isHome: boolean;
  canVoteFor: boolean;
}

interface VotePlayerCardProps {
  player: VotePlayer;
  isSelected: boolean;
  rank: number;
  onSelect: (arg1: string) => void;
}

export default function VotePlayerCard({
  player,
  isSelected,
  rank,
  onSelect,
}: VotePlayerCardProps) {
  return (
    <Button
      onClick={() => onSelect(player.id)}
      className={`group flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 text-left transition ${
        isSelected
          ? "border-accent bg-accent/20 text-accent"
          : "border-gray-700 bg-bg/30 text-gray-300 hover:border-accent/50 hover:bg-bg/50"
      }`}
    >
      <span className="font-medium">{player.nickname}</span>
      {isSelected ? (
        <span className="flex items-center rounded bg-accent/30 px-2 py-1 text-xs font-bold">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          {rank} points
        </span>
      ) : (
        <span className="invisible rounded bg-accent/10 px-2 py-1 text-xs group-hover:visible">
          Select
        </span>
      )}
    </Button>
  );
}
