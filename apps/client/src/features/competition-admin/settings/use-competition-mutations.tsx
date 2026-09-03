import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/config/axios-config";
import { config } from "@/config/config";
import { toast } from "sonner";
import { CompetitionType, SeasonResponse } from "@repo/shared-types";
import { AppError } from "@/hooks/use-error-handler/types";

/**
 * Every read that describes a Competition's seasons, by key prefix: after a
 * Start new season the Current season, its Standings, Fixtures, stats and match
 * lists all change.
 */
export function invalidateCompetitionReads(
  queryClient: QueryClient,
  competitionId: string,
) {
  const keys = [
    ["competitionInfo", competitionId],
    ["competitionSettings", competitionId],
    ["competition", { compId: competitionId }],
    ["leagueStandings", competitionId],
    ["leagueFixtures", competitionId],
    ["leagueStats", { competitionId }],
    ["matches"],
  ];
  return Promise.all(
    keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}

/** Start new season: a League admin goes on to Teams setup, a Duel admin stays. */
export function useStartNewSeason(
  competitionId: string,
  type: CompetitionType,
) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post<SeasonResponse>(
        `${config.server}/api/competitions/${competitionId}/seasons`,
        {},
        { withCredentials: true },
      );
      return data;
    },
    onSuccess: (season) => {
      invalidateCompetitionReads(queryClient, competitionId);
      toast.success(`Season ${season.number} has started.`);
      if (type === CompetitionType.LEAGUE) {
        navigate(`/league-setup/${competitionId}`);
      }
    },
    onError: (error: AppError) => {
      const message =
        error.response?.data?.message || "Failed to start a new season";
      toast.error(message);
    },
  });
}

export function useResetCompetition(competitionId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.post(
        `${config.server}/api/competitions/${competitionId}/reset`,
        {},
        { withCredentials: true },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["competition", { compId: competitionId }],
      });
      toast.success("Competition has been reset successfully");
      navigate("/competitions");
    },
    onError: (error: AppError) => {
      const message =
        error.response?.data?.message || "Failed to reset competition";
      toast.error(message);
    },
  });
}

export function useDeleteCompetition(competitionId: string) {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(
        `${config.server}/api/competitions/${competitionId}`,
        { withCredentials: true },
      );
    },
    onSuccess: () => {
      toast.success("Competition has been deleted successfully");
      navigate("/competitions");
    },
    onError: (error: AppError) => {
      const message =
        error.response?.data?.message || "Failed to delete competition";
      toast.error(message);
    },
  });
}
