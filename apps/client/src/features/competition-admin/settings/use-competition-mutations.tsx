import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/config/axios-config";
import { config } from "@/config/config";
import { toast } from "sonner";
import {
  CompetitionSettings,
  CompetitionType,
  SeasonResponse,
} from "@repo/shared-types";
import { AppError } from "@/hooks/use-error-handler/types";

/**
 * Every read that describes a Competition's seasons, by key prefix: after a
 * Start new season or a Reset competition the Current season, its Standings,
 * Fixtures, stats and match lists all change.
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

/**
 * Reset competition: every Season's Matches go and Season 1 starts again. A
 * League admin goes on to Teams setup to regenerate its Fixtures; a Duel admin
 * stays on the Settings tab, where the Season card re-renders as Season 1.
 */
export function useResetCompetition({
  id,
  name,
  type,
}: Pick<CompetitionSettings, "id" | "name" | "type">) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.post(
        `${config.server}/api/competitions/${id}/reset`,
        {},
        { withCredentials: true },
      );
    },
    onSuccess: () => {
      invalidateCompetitionReads(queryClient, id);
      toast.success(`"${name}" has been reset.`);
      if (type === CompetitionType.LEAGUE) {
        navigate(`/league-setup/${id}`);
      }
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
