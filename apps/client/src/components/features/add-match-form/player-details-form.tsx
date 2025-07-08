import { useMultiStepFormContext } from "../multi-step-form/multi-step-form-context";
import { AddDuelFormValues } from "@repo/shared-types";
import { Form } from "../../ui/form";
import { Button } from "../../ui/button";
import TeamInputStats from "./team-input-stats";
import { Team } from "../../../types/types";
import FormLayout from "./form-layout";

interface PlayerDetailsFormProps {
  isEdited: boolean;
}

export default function PlayerDetailsForm({
  isEdited,
}: PlayerDetailsFormProps) {
  const { form, prevStep, isStepValid } = useMultiStepFormContext();
  const data: AddDuelFormValues = form.getValues();

  return (
    <FormLayout title="Add player stats">
      <Form {...form}>
        <div className="mx-auto flex w-3/5 flex-col space-y-6 sm:space-y-8">
          <TeamInputStats team={Team.HOME} formData={data} form={form} />
          <TeamInputStats team={Team.AWAY} formData={data} form={form} />
        </div>
        <div
          className={`mt-6 flex w-full flex-row ${isEdited ? "justify-end" : "justify-between"} px-4 py-4 sm:mt-8 sm:px-6`}
        >
          {!isEdited && (
            <Button
              type="button"
              className="rounded-lg border-2 border-accent/50 bg-transparent px-4 py-2 text-accent hover:bg-accent/10 sm:px-5 sm:py-2.5"
              onClick={prevStep}
            >
              Previous
            </Button>
          )}
          <Button
            type={"submit"}
            className="transform rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 font-bold text-accent shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-accent/30"
            disabled={!isStepValid()}
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </FormLayout>
  );
}
