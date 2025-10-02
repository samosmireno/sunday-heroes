import { config } from "@/config/config";
import { AppError } from "@/hooks/use-error-handler/types";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
import { MatchResponse } from "@repo/shared-types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useMatchDetails = (matchId: string) => {
  const { handleError } = useErrorHandler();

  const fetchMatchDetails = async (matchId: string): Promise<MatchResponse> => {
    try {
      const { data } = await axios.get(
        `${config.server}/api/matches/${matchId}`,
      );
      return data;
    } catch (error) {
      handleError(error as AppError, {
        showToast: true,
        logError: true,
        throwError: false,
      });
      throw error;
    }
  };

  const leagueFixturesQuery = useQuery({
    queryKey: ["leagueFixtures", matchId],
    queryFn: () => fetchMatchDetails(matchId),
    enabled: !!matchId,
    staleTime: 0,
  });

  const isMatchUnfinished = (match: MatchResponse | undefined): boolean => {
    if (!match) return false;

    if (!match.players || match.players.length === 0) return false;

    const requiredFields = Object.values(match).filter(
      (value) => value !== match.players,
    );

    return requiredFields.every(
      (field) => field !== null && field !== undefined,
    );
  };

  return {
    match: leagueFixturesQuery.data,
    isMatchLoading: leagueFixturesQuery.isLoading,
    isMatchCompleted: leagueFixturesQuery.data?.isCompleted,
    isMatchUnfinished: !isMatchUnfinished(leagueFixturesQuery.data),
    refetch: leagueFixturesQuery.refetch,
    error: leagueFixturesQuery.error,
  };
};
