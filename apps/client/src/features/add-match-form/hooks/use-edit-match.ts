import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { matchService } from "../services/match-service";
import { useFormMatchData } from "@/features/add-match-form/hooks/use-form-match-data";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
import { CompetitionType } from "@repo/shared-types";
import { AppError } from "@/hooks/use-error-handler/types";
import { createMatchFormSchema } from "../schemas/schema-factory";
import { MatchFormData } from "../schemas/types";
import { competitionKeys, matchKeys } from "@/features/competition/query-keys";

export function useEditMatch(
  competitionType: CompetitionType = CompetitionType.DUEL,
  competitionId: string,
  matchId: string,
) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  const { formData, isLoading: isLoadingMatch } = useFormMatchData(matchId);
  const formSchema = createMatchFormSchema(competitionType);

  const form = useForm<MatchFormData>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onBlur",
    mode: "onBlur",
    defaultValues: {
      match: {
        date: undefined,
        homeTeamScore: 0,
        awayTeamScore: 0,
        matchType: undefined,
        hasPenalties: false,
        penaltyHomeScore: 0,
        penaltyAwayScore: 0,
        homeTeam: undefined,
        awayTeam: undefined,
      },
      players: {
        homePlayers: [],
        awayPlayers: [],
      },
      matchPlayers: {
        players: [],
      },
    },
  });

  const editMatchMutation = useMutation({
    mutationFn: (data: MatchFormData) =>
      matchService.updateMatch(matchId, data, competitionId, competitionType),
    onSuccess: () => {
      // The form's own read is cached for minutes, so without this a
      // reopened edit form would still show the pre-edit values.
      queryClient.invalidateQueries({ queryKey: matchKeys.formData(matchId) });
      queryClient.invalidateQueries({
        queryKey: competitionKeys.detailPrefix(competitionId),
      });
      queryClient.invalidateQueries({ queryKey: matchKeys.all() });
      navigate(`/competition/${competitionId}`);
    },
    onError: (error) => {
      handleError(error as AppError, {
        showToast: true,
        logError: true,
        throwError: false,
      });
    },
  });

  // Load form data when editing
  useEffect(() => {
    if (formData) {
      form.setValue("match", formData.match);
      form.setValue("players", formData.players);
      form.setValue("matchPlayers", formData.matchPlayers);
    }
  }, [formData, form]);

  return {
    form,
    formSchema,
    isLoading: isLoadingMatch,
    isSubmitting: editMatchMutation.isPending,
    handleSubmit: editMatchMutation.mutate,
  };
}
