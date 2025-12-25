import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompetitionType } from "@repo/shared-types";
import {
  CreateCompetitionFormSchema,
  CreateCompetitionFormValues,
} from "@/features/create-competition-form/create-competition-schema";
import { transformCompetitionFormToRequest } from "./utils";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
import axiosInstance from "@/config/axios-config";
import { AppError } from "@/hooks/use-error-handler/types";
import { toast } from "sonner";

export function useCreateCompetition() {
  const navigate = useNavigate();
  const { userId } = useParams() as { userId: string };
  const { handleError } = useErrorHandler();

  const form = useForm<CreateCompetitionFormValues>({
    resolver: zodResolver(CreateCompetitionFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      type: undefined,
      trackSeasons: false,
      votingEnabled: false,
      votingPeriodDays: "" as unknown as number,
      reminderDays: "" as unknown as number,
      knockoutVotingPeriodDays: "" as unknown as number,
      numberOfTeams: "" as unknown as number,
      matchType: undefined,
      isRoundRobin: false,
    },
  });

  const votingEnabled: boolean = form.watch("votingEnabled");
  const competitionType: CompetitionType = form.watch("type");

  const createCompetitionMutation = useMutation({
    mutationFn: async (values: CreateCompetitionFormValues) => {
      if (!userId) throw new Error("User ID is required");

      const reqData = transformCompetitionFormToRequest(values, userId);

      if (values.type !== CompetitionType.LEAGUE) {
        return axiosInstance.post(`/api/competitions`, reqData);
      } else {
        return axiosInstance.post(`/api/leagues`, reqData);
      }
    },
    onSuccess: (response, variables) => {
      if (variables.type === CompetitionType.LEAGUE) {
        toast.success("League has been created successfully!");
        navigate(`/league-setup/${response.data.competition.id}`);
      } else {
        toast.success(
          "Competition has been created successfully! Add a match to start tracking stats.",
        );
        navigate(-1);
      }
    },
    onError: (error) => {
      handleError(error as AppError, {
        showToast: true,
        logError: true,
        throwError: false,
      });
    },
  });

  useEffect(() => {
    if (votingEnabled === false) {
      form.setValue("votingPeriodDays", undefined);
      form.setValue("reminderDays", undefined);
      form.setValue("knockoutVotingPeriodDays", undefined);
    }
  }, [votingEnabled, form]);

  useEffect(() => {
    if (competitionType !== CompetitionType.LEAGUE) {
      form.setValue("numberOfTeams", undefined);
      form.setValue("matchType", undefined);
      form.setValue("isRoundRobin", false);
    }
  }, [competitionType, form]);

  return {
    form,
    votingEnabled,
    competitionType,
    isSubmitting: createCompetitionMutation.isPending,
    handleSubmit: createCompetitionMutation.mutate,
    handleCancel: () => navigate(-1),
  };
}
