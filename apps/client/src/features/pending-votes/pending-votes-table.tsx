import { MatchVotes } from "@repo/shared-types";
import { PendingVoteRow } from "./pending-votes-row";

interface PendingVotesTableProps {
  votingData: MatchVotes;
  onVoteClick: (matchId: string, playerId: string) => void;
}

export function PendingVotesTable({
  votingData,
  onVoteClick,
}: PendingVotesTableProps) {
  if (votingData.players.length === 0) {
    return (
      <div className="rounded-lg bg-bg/30 p-8 text-center text-gray-400">
        All players have submitted their votes!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-accent/30 text-left text-gray-300">
            <th className="p-1 text-sm sm:p-3 sm:text-base">Player Name</th>
            <th className="p-1 text-sm sm:p-3 sm:text-base">Match</th>
            <th className="hidden p-1 text-sm sm:block sm:p-3 sm:text-base">
              Date
            </th>
            <th className="p-1 text-sm sm:p-3 sm:text-base">Action</th>
          </tr>
        </thead>
        <tbody>
          {votingData.players.map((vote) => (
            <PendingVoteRow
              key={`${votingData.matchId}-${vote.playerId}`}
              vote={vote}
              matchId={votingData.matchId}
              teams={votingData.teams}
              homeScore={votingData.homeScore}
              awayScore={votingData.awayScore}
              matchDate={votingData.matchDate}
              userRole={votingData.userRole}
              onVoteClick={onVoteClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
