import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { Button } from "../components/ui/button";
import Header from "../components/ui/header";
import Background from "../components/ui/background";
import { usePendingVotes } from "../hooks/use-pending-votes";

export default function AdminPendingVotes() {
  const { competitionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!competitionId) return;

  const { votingData, isLoading, error } = usePendingVotes(competitionId);

  const handleVoteClick = (matchId: string, playerId: string) => {
    navigate(`/vote/${matchId}?voterId=${playerId}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <div className="rounded-lg border-2 border-red-500 bg-panel-bg p-6 text-center">
          <h2 className="mb-4 text-xl font-bold text-red-500">Error</h2>
          <p className="text-gray-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!votingData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <div className="rounded-lg border-2 border-accent bg-panel-bg p-6 text-center">
          <h2 className="mb-4 text-xl font-bold text-accent">
            Competition Not Found
          </h2>
          <p className="text-gray-200">
            The requested competition could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex-1 bg-bg p-6">
      <Background />
      <Header
        title={`Pending Votes for ${votingData.competitionName}`}
        hasSidebar={false}
      />

      <div className="relative rounded-lg border-2 border-accent bg-panel-bg p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-accent">
          Pending Player Votes
        </h2>

        {votingData.pendingVotes.length === 0 ? (
          <div className="rounded-lg bg-bg/30 p-8 text-center text-gray-400">
            All players have submitted their votes!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-accent/30 text-left text-gray-300">
                  <th className="p-1 text-sm sm:p-3 sm:text-base">
                    Player Name
                  </th>
                  <th className="p-1 text-sm sm:p-3 sm:text-base">Match</th>
                  <th className="hidden p-1 text-sm sm:block sm:p-3 sm:text-base">
                    Date
                  </th>
                  <th className="p-1 text-sm sm:p-3 sm:text-base">Action</th>
                </tr>
              </thead>
              <tbody>
                {votingData.pendingVotes.map((vote) => (
                  <tr
                    key={`${vote.matchId}-${vote.playerId}`}
                    className="border-b border-accent/10"
                  >
                    <td className="p-1 text-sm font-medium text-accent sm:p-3 sm:text-base">
                      {vote.playerName}
                    </td>
                    <td className="p-1 text-sm text-gray-300 sm:p-3 sm:text-base">
                      <div className="flex flex-col sm:items-center md:flex-row">
                        <span className="mb-1 sm:mb-0">
                          {vote.teams[0]} vs {vote.teams[1]}
                        </span>
                        <span className="text-accent sm:ml-2">
                          ({vote.homeScore} - {vote.awayScore})
                        </span>
                      </div>
                    </td>
                    <td className="hidden p-1 text-sm text-gray-300 sm:block sm:p-3 sm:text-base">
                      {new Date(vote.matchDate).toLocaleDateString()}
                    </td>

                    <td className="p-3 px-5 text-sm sm:text-base">
                      {!vote.voted && (
                        <Button
                          onClick={() =>
                            handleVoteClick(vote.matchId, vote.playerId)
                          }
                          className="bg-accent/20 p-1 text-accent hover:bg-accent/30 sm:p-3"
                        >
                          Vote
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
