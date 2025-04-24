import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import { useMatchData } from "../hooks/use-match-data";
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
import AddMatchForm from "../components/features/add-match-form/add-match-form";
import AddPlayerDetailsForm from "../components/features/add-match-form/add-player-details-form";
import AddPlayersForm from "../components/features/add-match-form/add-players-form";
import StepNavigation from "../components/features/add-match-form/form-step-navigation";
import { MatchResponse, AddDuelFormValues } from "@repo/logger";
import { AddDuelFormSchema } from "../components/features/add-match-form/schema";
import { transformDuelFormToRequest } from "../utils/transform";
import { Trophy } from "lucide-react";
import { config } from "../config/config";

export default function AddMultiForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [footballFieldMatch, setFootballFieldMatch] =
    useState<MatchResponse | null>(null);

  const navigate = useNavigate();
  const { matchId, competitionId } = useParams<{
    matchId: string;
    competitionId: string;
  }>();
  const { formData } = useMatchData(matchId);

  const form = useForm<AddDuelFormValues>({
    resolver: zodResolver(AddDuelFormSchema),
    reValidateMode: "onBlur",
    mode: "onBlur",
  });

  const formValues = useWatch({ control: form.control });

  const handleSubmit = async (data: AddDuelFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!competitionId) {
      setIsSubmitting(false);
      return;
    }

    const reqData = transformDuelFormToRequest(data, competitionId, 1);

    try {
      let response;
      if (matchId) {
        response = await axiosInstance.put(
          `${config.server}/api/matches/${matchId}`,
          reqData,
          {
            withCredentials: true,
          },
        );
      } else {
        response = await axiosInstance.post(
          `${config.server}/api/matches`,
          reqData,
          {
            withCredentials: true,
          },
        );
      }

      console.log("Match saved successfully:", response.data);
      navigate(`/competition/${competitionId}`);
    } catch (error) {
      console.error("Error saving match:", error);
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

  return (
    <div className="relative flex-1 p-3 sm:p-4 md:p-6">
      <div
        className="pointer-events-none fixed inset-0 z-50 bg-repeat"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0.03) 2px)",
        }}
      ></div>

      <div
        className="animate-scanline pointer-events-none fixed inset-0 z-40"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(0,0,0,0.03), transparent)",
        }}
      ></div>

      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(45deg, rgba(0,0,0,0.2) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2) 75%, transparent 75%, transparent)",
          backgroundSize: "10px 10px",
        }}
      ></div>

      <header className="relative mb-4 rounded-lg border-2 border-accent bg-panel-bg p-3 shadow-lg sm:mb-6 sm:p-4 md:mb-8">
        <div className="flex items-center">
          <h1
            className="text-xl font-bold uppercase tracking-wider text-accent sm:text-2xl md:text-3xl"
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            <Trophy className="mr-2 inline-block h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
            {matchId ? "Edit Match" : "Add Match"}
          </h1>
        </div>
      </header>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col justify-center rounded-lg border-2 border-accent bg-panel-bg p-4 text-center sm:p-6">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent sm:h-12 sm:w-12"></div>
            <p className="text-base font-bold text-accent sm:text-lg">
              {matchId ? "Updating match..." : "Creating match..."}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="relative rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg sm:p-6">
            <MultiStepForm
              schema={AddDuelFormSchema}
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
                <AddMatchForm isEdited={matchId ? true : false} />
              </MultiStepFormStep>
              <MultiStepFormStep name="players">
                <AddPlayersForm isEdited={matchId ? true : false} />
              </MultiStepFormStep>
              <MultiStepFormStep name="matchPlayers">
                <AddPlayerDetailsForm isEdited={matchId ? true : false} />
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
