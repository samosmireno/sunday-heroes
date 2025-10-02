import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import { CompetitionType, CompetitionResponse } from "@repo/shared-types";
import { MatchFormData } from "./add-match-schemas";
import { createFootballFieldMatch } from "./utils/utils";
import FootballField from "../football-field/football-field";
import {
  MultiStepForm,
  MultiStepFormContextProvider,
} from "../multi-step-form/multi-step-form";
import { MultiStepFormHeader } from "../multi-step-form/multi-step-form-header";
import { MultiStepFormStep } from "../multi-step-form/multi-step-form-step";
import StepNavigation from "./form-step-navigation";
import MatchDetailsForm from "./match-details-form/match-details-form";
import PlayerDetailsForm from "./player-details-form/player-details-form";
import PlayersListForm from "./player-list-form/player-list-form";
import LeagueMatchDetailsForm from "./match-details-form/league-match-details-form";
import { UseFormReturn } from "react-hook-form";
import { ZodSchema } from "zod";

interface MatchFormContentProps {
  form: UseFormReturn<MatchFormData>;
  formSchema: ZodSchema;
  competition: CompetitionResponse;
  isEditing: boolean;
  onSubmit: (data: MatchFormData) => void;
}

export function MatchFormContent({
  form,
  formSchema,
  competition,
  isEditing,
  onSubmit,
}: MatchFormContentProps) {
  const formValues = useWatch({ control: form.control });

  const footballFieldMatch = useMemo(() => {
    if (formValues.match && formValues.players) {
      return createFootballFieldMatch(form.getValues());
    }
    return undefined;
  }, [formValues]);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <div className="relative rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg sm:p-6">
          <MultiStepForm schema={formSchema} form={form} onSubmit={onSubmit}>
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
              <PlayersListForm isEdited={isEditing} />
            </MultiStepFormStep>

            <MultiStepFormStep name="matchPlayers">
              <PlayerDetailsForm isEdited={isEditing} />
            </MultiStepFormStep>
          </MultiStepForm>
        </div>
      </div>

      <div className="hidden xl:block">
        <div className="sticky top-20 rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg">
          <h2 className="mb-4 text-lg font-bold text-accent">Match Preview</h2>
          <FootballField match={footballFieldMatch} hoverable={false} />
        </div>
      </div>
    </div>
  );
}
