import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loading from "../../ui/loading";
import { CompetitionResponse, LeagueMatchResponse } from "@repo/shared-types";
import { useLeagueFixtures } from "../../../hooks/use-league-fixtures";
import { useMatchDetails } from "../../../hooks/use-match-details";
import LeagueMatchCard from "./league-match-card";
import LeagueMatchDetails from "./league-match-details";
import { useCompleteMatch } from "../../../hooks/use-complete-match";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

interface LeagueMatchListProps {
  competition: CompetitionResponse;
}

export default function LeagueMatchList({ competition }: LeagueMatchListProps) {
  const [selectedMatch, setSelectedMatch] =
    useState<LeagueMatchResponse | null>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { leagueFixtures, isFixturesLoading } = useLeagueFixtures(
    competition.id,
  );
  const { match, isMatchLoading, isMatchCompleted, isMatchUnfinished } =
    useMatchDetails(selectedMatch?.id || "");
  const completeMatchMutation = useCompleteMatch(competition.id);

  const rounds = Object.keys(leagueFixtures)
    .map(Number)
    .sort((a, b) => a - b);

  const activeRound = searchParams.get("round")
    ? Number(searchParams.get("round"))
    : rounds[0] || null;

  const handleRoundChange = (roundStr: string) => {
    const round = Number(roundStr);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("round", roundStr);
    setSearchParams(newSearchParams);

    if (leagueFixtures[round]?.length > 0) {
      setSelectedMatch(leagueFixtures[round][0]);
    }
  };

  const handleEditMatch = () => {
    if (selectedMatch) {
      navigate(`/edit-match/${competition.id}/${selectedMatch.id}`);
    }
  };

  const handleCompleteMatch = async () => {
    if (selectedMatch) {
      await completeMatchMutation.mutateAsync(selectedMatch.id);
    }
  };

  useEffect(() => {
    if (!isFixturesLoading && rounds.length > 0 && activeRound) {
      if (!selectedMatch && leagueFixtures[activeRound]?.length > 0) {
        setSelectedMatch(leagueFixtures[activeRound][0]);
      }
    }
  }, [isFixturesLoading, rounds, leagueFixtures, activeRound, selectedMatch]);

  if (isFixturesLoading || isMatchLoading) {
    return <Loading text="Loading matches..." />;
  }

  if (rounds.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400">No matches found.</div>
    );
  }

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <Tabs
          value={activeRound?.toString() || ""}
          onValueChange={handleRoundChange}
          className="w-full"
        >
          <div className="h-full w-full overflow-x-auto">
            <TabsList className="flex h-full w-max min-w-full gap-1 bg-bg/30 p-2 pb-4">
              {rounds.map((round) => (
                <TabsTrigger
                  key={round}
                  value={round.toString()}
                  className="flex-shrink-0 whitespace-nowrap text-sm data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
                >
                  Round {round}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {rounds.map((round) => (
            <TabsContent key={round} value={round.toString()}>
              <div className="max-h-screen space-y-2 overflow-y-auto">
                {leagueFixtures[round]?.map((match) => (
                  <LeagueMatchCard
                    key={match.id}
                    match={match}
                    isSelected={selectedMatch?.id === match.id}
                    onSelect={setSelectedMatch}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="lg:col-span-3">
        <div className="flex h-full min-h-[400px] flex-col rounded-lg border-2 border-accent/30 bg-panel-bg">
          {selectedMatch ? (
            <LeagueMatchDetails
              role={competition.userRole}
              selectedMatch={selectedMatch}
              match={match || null}
              isMatchCompleted={isMatchCompleted || false}
              isMatchUnfinished={isMatchUnfinished}
              onEditMatch={handleEditMatch}
              onCompleteMatch={handleCompleteMatch}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              Select a match to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
