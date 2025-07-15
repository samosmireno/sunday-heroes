import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../config/axios-config";
import { useFormMatchData } from "../hooks/use-form-match-data";
import { createFootballFieldMatch } from "../utils/utils";
import FootballField from "../components/features/football-field/football-field";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MultiStepForm,
  MultiStepFormContextProvider,
} from "../components/features/multi-step-form/multi-step-form";
import { MultiStepFormHeader } from "../components/features/multi-step-form/multi-step-form-header";
import { MultiStepFormStep } from "../components/features/multi-step-form/multi-step-form-step";
import StepNavigation from "../components/features/add-match-form/form-step-navigation";
import { CompetitionType, MatchResponse } from "@repo/shared-types";
import {
  createMatchFormSchema,
  LeagueFormData,
  MatchFormData,
} from "../components/features/add-match-form/add-match-schemas";
import {
  transformDuelFormToRequest,
  transformLeagueFormToRequest,
} from "../utils/transform";
import { config } from "../config/config";
import Background from "../components/ui/background";
import Header from "../components/ui/header";
import Loading from "../components/ui/loading";
import MatchDetailsForm from "../components/features/add-match-form/match-details-form";
import PlayerDetailsForm from "../components/features/add-match-form/player-details-form";
import { useCompetition } from "../hooks/use-competition";
import PlayersListForm from "../components/features/add-match-form/player-list-form";
import { useAuth } from "../context/auth-context";
import LeagueMatchDetailsForm from "../components/features/add-match-form/league-match-details-form";
import { useErrorHandler } from "../hooks/use-error-handler";

export default function AddMatchForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [footballFieldMatch, setFootballFieldMatch] = useState<MatchResponse>();
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const navigate = useNavigate();
  const { matchId, competitionId } = useParams<{
    matchId: string;
    competitionId: string;
  }>();
  const { formData } = useFormMatchData(matchId);
  const { competition, isLoading: isLoadingCompetition } = useCompetition(
    competitionId ?? "",
    user?.id ?? "",
  );

  const formSchema = useMemo(() => {
    return competition ? createMatchFormSchema(competition.type) : null;
  }, [competition]);

  const form = useForm<MatchFormData>({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
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

  const formValues = useWatch({ control: form.control });

  const handleSubmit = async (data: MatchFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!competitionId) {
      setIsSubmitting(false);
      return;
    }

    try {
      let reqData;
      if (competition && competition.type === CompetitionType.DUEL) {
        reqData = transformDuelFormToRequest(data, competitionId);
      } else {
        reqData = transformLeagueFormToRequest(
          data as LeagueFormData,
          competitionId,
        );
      }

      const endpoint = matchId
        ? `${config.server}/api/matches/${matchId}`
        : `${config.server}/api/matches`;

      const method = matchId ? "put" : "post";

      await axiosInstance[method](endpoint, reqData, {
        withCredentials: true,
      });
      navigate(`/competition/${competitionId}`);
    } catch (error) {
      handleError(error, {
        showToast: true,
        logError: true,
        throwError: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (matchId && formData) {
      form.setValue("match", formData.match);
      form.setValue("players", formData.players);
      form.setValue("matchPlayers", formData.matchPlayers);
    }
  }, [matchId, form, formData]);

  useEffect(() => {
    if (form.getValues("match") && form.getValues("players"))
      setFootballFieldMatch(createFootballFieldMatch(form.getValues()));
  }, [form, formValues]);

  if (isLoadingCompetition) {
    return (
      <div className="relative flex-1 p-3 sm:p-4 md:p-6">
        <Background />
        <Header title="Match Form" hasSidebar={true} />
        <Loading text="Loading competition data..." />
      </div>
    );
  }

  if (!competition || !formSchema) {
    return (
      <div className="relative flex-1 p-3 sm:p-4 md:p-6">
        <Background />
        <Header title="Match Form" hasSidebar={true} />
        <div className="p-6 text-center">
          <p>Competition not found or invalid data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 p-3 sm:p-4 md:p-6">
      <Background />
      <Header title={matchId ? "Edit Match" : "Add Match"} hasSidebar={true} />

      {isSubmitting && (
        <Loading text={matchId ? "Updating match..." : "Creating match..."} />
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="relative rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg sm:p-6">
            <MultiStepForm
              schema={formSchema}
              form={form}
              onSubmit={handleSubmit}
            >
              <MultiStepFormHeader>
                <MultiStepFormContextProvider>
                  {({ currentStepIndex }) => (
                    <StepNavigation
                      steps={["Match Info", "Players", "Player Stats"]}
                      currentStep={currentStepIndex}
                    />
                  )}
                </MultiStepFormContextProvider>
              </MultiStepFormHeader>

              <MultiStepFormStep name="match">
                {competition.type !== CompetitionType.DUEL ? (
                  <LeagueMatchDetailsForm />
                ) : (
                  <MatchDetailsForm />
                )}
              </MultiStepFormStep>
              <MultiStepFormStep name="players">
                <PlayersListForm isEdited={!!matchId} />
              </MultiStepFormStep>
              <MultiStepFormStep name="matchPlayers">
                <PlayerDetailsForm isEdited={!!matchId} />
              </MultiStepFormStep>
            </MultiStepForm>
          </div>
        </div>
        <div className="hidden xl:block">
          <div className="sticky top-20 rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-accent">
              Match Preview
            </h2>
            <FootballField match={footballFieldMatch} isEdited={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
