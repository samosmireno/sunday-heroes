import axios from "axios";
import { config } from "../config/config";
import { useQuery } from "@tanstack/react-query";
import { MatchResponse } from "@repo/shared-types";
import { useErrorHandler } from "./use-error-handler";

export const useMatchDetails = (matchId: string) => {
  const { handleError } = useErrorHandler();

  const fetchMatchDetails = async (matchId: string): Promise<MatchResponse> => {
    try {
      const { data } = await axios.get(
        `${config.server}/api/matches/${matchId}`,
      );
      return data;
    } catch (error) {
      handleError(error, {
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
    isMatchCompleted: leagueFixturesQuery.data?.is_completed,
    isMatchUnfinished: !isMatchUnfinished(leagueFixturesQuery.data),
    refetch: leagueFixturesQuery.refetch,
    error: leagueFixturesQuery.error,
  };
};
