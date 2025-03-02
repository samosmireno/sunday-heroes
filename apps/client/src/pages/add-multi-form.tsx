import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import { useMatchData } from "../hooks/use-match-data";
import { createFootballFieldMatch } from "../utils/utils";
import { MdArrowBack } from "react-icons/md";
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
import { AddDuelFormSchema } from "../components/features/multi-step-form/schema";
import { transformDuelFormToRequest } from "../utils/transform";

export default function AddMultiForm() {
  const form = useForm<AddDuelFormValues>({
    resolver: zodResolver(AddDuelFormSchema),
    reValidateMode: "onBlur",
    mode: "onBlur",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formValues = useWatch({ control: form.control });

  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const { formData } = useMatchData(matchId);
  const [footballFieldMatch, setFootballFieldMatch] =
    useState<MatchResponse | null>(
      formData ? createFootballFieldMatch(formData) : null,
    );

  const handleSubmit = async (data: AddDuelFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const reqData = transformDuelFormToRequest(
      data,
      "fedf74da-68d0-4476-93f8-298931efc52b",
      1,
    );

    console.log("ReqData:", reqData);

    try {
      let response;
      if (matchId) {
        response = await axiosInstance.put(`/api/matches/${matchId}`, reqData, {
          withCredentials: true,
        });
      } else {
        console.log(axiosInstance);
        response = await axiosInstance.post(`/api/matches`, reqData, {
          withCredentials: true,
        });
      }

      console.log("Match added successfully:", response.data);
      navigate("/");
    } catch (error) {
      console.error("Error adding match:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (matchId && formData) {
      form.setValue("match", formData.match);
      form.setValue("players", formData.players);
      form.setValue("matchPlayers", formData.matchPlayers);
      console.log("effect: ", formData);
    }
  }, [matchId, form, formData]);

  useEffect(() => {
    console.log(formValues);
    if (form.getValues("match") && form.getValues("players"))
      setFootballFieldMatch(createFootballFieldMatch(formValues));
  }, [form, formValues]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-200 to-white font-exo">
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col justify-center rounded-lg bg-white p-6 text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
            <p className="text-lg font-semibold">Submitting form...</p>
          </div>
        </div>
      )}
      <Link to="/" className="px-4 py-2 text-4xl">
        <MdArrowBack />
      </Link>
      <h1 className="p-8 text-2xl font-medium">
        {matchId ? "Edit match" : "Add match"}
      </h1>
      <div className="flex h-full flex-row items-start justify-center space-x-32">
        <div className="flex h-full max-w-2xl flex-grow flex-col">
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
        <div className="hidden xl:sticky xl:top-1/4 xl:block">
          <FootballField
            match={footballFieldMatch}
            isEdited={true}
          ></FootballField>
        </div>
      </div>
    </div>
  );
}
