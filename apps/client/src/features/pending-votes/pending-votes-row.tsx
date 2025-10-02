// components/features/pending-votes/pending-vote-row.tsx
import { Button } from "@/components/ui/button";
import { Role, PendingVote } from "@repo/shared-types";

interface PendingVoteRowProps {
  vote: PendingVote;
  matchId: string;
  teams: string[];
  homeScore: number;
  awayScore: number;
  matchDate?: string;
  userRole: Role;
  onVoteClick: (matchId: string, playerId: string) => void;
}

export function PendingVoteRow({
  vote,
  matchId,
  teams,
  homeScore,
  awayScore,
  matchDate,
  userRole,
  onVoteClick,
}: PendingVoteRowProps) {
  const canVote = !vote.voted && (vote.isUser || userRole !== Role.PLAYER);

  return (
    <tr className="border-b border-accent/10">
      <td className="p-1 text-sm font-medium text-accent sm:p-3 sm:text-base">
        {vote.playerName}
      </td>
      <td className="p-1 text-sm text-gray-300 sm:p-3 sm:text-base">
        <div className="flex flex-col sm:items-center md:flex-row">
          <span className="mb-1 sm:mb-0">
            {teams[0]} vs {teams[1]}
          </span>
          <span className="text-accent sm:ml-2">
            ({homeScore} - {awayScore})
          </span>
        </div>
      </td>
      <td className="hidden p-1 text-sm text-gray-300 sm:block sm:p-3 sm:text-base">
        {matchDate ? new Date(matchDate).toLocaleDateString() : "TBD"}
      </td>
      <td className="p-3 px-5 text-sm sm:text-base">
        {canVote && (
          <Button
            onClick={() => onVoteClick(matchId, vote.playerId)}
            className="bg-accent/20 p-1 text-accent hover:bg-accent/30 sm:p-3"
          >
            Vote
          </Button>
        )}
      </td>
    </tr>
  );
}
