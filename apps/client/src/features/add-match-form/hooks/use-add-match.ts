import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { matchService } from "../services/match-service";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
import { CompetitionResponse } from "@repo/shared-types";
import { AppError } from "@/hooks/use-error-handler/types";
import { createMatchFormSchema } from "../schemas/schema-factory";
import { MatchFormData } from "../schemas/types";

export function useAddMatch(
  competition: CompetitionResponse,
  competitionId: string,
) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  const formSchema = createMatchFormSchema(competition.type);

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

  const addMatchMutation = useMutation({
    mutationFn: (data: MatchFormData) =>
      matchService.createMatch(data, competitionId, competition.type),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["competition", competitionId],
      });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
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

  return {
    form,
    formSchema,
    isSubmitting: addMatchMutation.isPending,
    handleSubmit: addMatchMutation.mutate,
  };
}
