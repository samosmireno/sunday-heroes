import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import Header from "../components/ui/header";
import Background from "../components/ui/background";

export const mockCompetitionsVotingData = [
  {
    id: "comp-1",
    name: "Premier League 2024-2025",
    pendingVotesCount: 12,
    closedVotesCount: 48,
    votingEnabled: true,
  },
  {
    id: "comp-2",
    name: "Champions League Group Stage",
    pendingVotesCount: 5,
    closedVotesCount: 15,
    votingEnabled: true,
  },
  {
    id: "comp-3",
    name: "FA Cup Quarter Finals",
    pendingVotesCount: 0,
    closedVotesCount: 8,
    votingEnabled: true,
  },
  {
    id: "comp-4",
    name: "Sunday League Division A",
    pendingVotesCount: 24,
    closedVotesCount: 36,
    votingEnabled: true,
  },
  {
    id: "comp-5",
    name: "European Championship Qualifiers",
    pendingVotesCount: 7,
    closedVotesCount: 21,
    votingEnabled: true,
  },
  {
    id: "comp-6",
    name: "World Cup 2026 Qualifiers",
    pendingVotesCount: 0,
    closedVotesCount: 0,
    votingEnabled: false,
  },
  {
    id: "comp-7",
    name: "Community Shield",
    pendingVotesCount: 0,
    closedVotesCount: 2,
    votingEnabled: true,
  },
];

export default function VotesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCompetitionClick = (competitionId: string) => {
    navigate(`/pending-votes/${competitionId}`);
  };

  const competitionsData = mockCompetitionsVotingData;

  //   if (isLoading) {
  //     return (
  //       <div className="flex h-screen items-center justify-center">
  //         <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
  //       </div>
  //     );
  //   }

  //   if (error) {
  //     return (
  //       <div className="flex h-screen flex-col items-center justify-center p-4">
  //         <div className="rounded-lg border-2 border-red-500 bg-panel-bg p-6 text-center">
  //           <h2 className="mb-4 text-xl font-bold text-red-500">Error</h2>
  //           <p className="text-gray-200">{error}</p>
  //         </div>
  //       </div>
  //     );
  //   }

  return (
    <div className="min-h-screen flex-1 bg-bg p-3 sm:p-6">
      <Background />
      <Header title="Competition Voting" hasSidebar={false} />

      <div className="relative mt-2 rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg sm:mt-0 sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-accent sm:mb-6 sm:text-xl">
          Active Voting Competitions
        </h2>

        {!competitionsData ||
        competitionsData.filter((comp) => comp.votingEnabled).length === 0 ? (
          <div className="rounded-lg bg-bg/30 p-4 text-center text-gray-400 sm:p-8">
            No competitions with active voting found.
          </div>
        ) : (
          <div className="xs:grid-cols-1 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {competitionsData
              .filter((comp) => comp.votingEnabled)
              .map((competition) => (
                <div
                  key={competition.id}
                  onClick={() => handleCompetitionClick(competition.id)}
                  className="flex h-full cursor-pointer flex-col rounded-lg border-2 border-accent/30 bg-bg/50 p-2.5 transition-all hover:border-accent hover:bg-bg/80 sm:p-4 md:p-5"
                >
                  <h3 className="mb-1.5 truncate text-sm font-semibold text-accent sm:mb-2 sm:text-base md:mb-3 md:text-lg">
                    {competition.name}
                  </h3>

                  <div className="mt-1.5 flex justify-between sm:mt-2 md:mt-4">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-accent sm:text-xl md:text-2xl">
                        {competition.pendingVotesCount}
                      </span>
                      <span className="text-xs text-gray-300 sm:text-xs md:text-sm">
                        Pending
                      </span>
                    </div>

                    <div className="h-8 w-px bg-accent/20 sm:h-10"></div>

                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-gray-300 sm:text-xl md:text-2xl">
                        {competition.closedVotesCount}
                      </span>
                      <span className="text-xs text-gray-300 sm:text-xs md:text-sm">
                        Completed
                      </span>
                    </div>
                  </div>

                  {competition.pendingVotesCount > 0 && (
                    <div className="mt-2 flex justify-center sm:mt-3 md:mt-4">
                      <span className="max-w-full truncate rounded-full bg-accent/20 px-1.5 py-0.5 text-xs text-accent sm:px-2 sm:py-1 sm:text-xs">
                        {competition.pendingVotesCount} votes need attention
                      </span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
