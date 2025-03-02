import { useMultiStepFormContext } from "../multi-step-form/multi-step-form-context";
import { AddDuelFormValues } from "@repo/logger";
import { Form } from "../../ui/form";
import { Button } from "../../ui/button";
import TeamInputStats from "./team-input-stats";
import { Team } from "../../../types/types";
import FormLayout from "./form-layout";

interface AddPlayerDetailsFormProps {
  isEdited: boolean;
}

export default function AddPlayerDetailsForm({
  isEdited,
}: AddPlayerDetailsFormProps) {
  const { form, prevStep, isStepValid } = useMultiStepFormContext();
  const data: AddDuelFormValues = form.getValues();

  return (
    <FormLayout title="Add player stats">
      <Form {...form}>
        <div className="flex w-full flex-col space-y-8">
          <TeamInputStats team={Team.HOME} formData={data} form={form} />
          <TeamInputStats team={Team.AWAY} formData={data} form={form} />
        </div>
        <div
          className={`flex w-full flex-row p-10 ${isEdited ? "justify-end" : "justify-between"}`}
        >
          {!isEdited && (
            <Button type={"button"} variant={"outline"} onClick={prevStep}>
              Previous
            </Button>
          )}
          <Button
            className="border-green-300 bg-gradient-to-br from-green-400 to-green-600 transition-all duration-300 ease-linear hover:from-green-400 hover:to-green-800"
            type={"submit"}
            disabled={!isStepValid()}
          >
            {isEdited ? "Save Changes" : "Submit"}
          </Button>
        </div>
      </Form>
    </FormLayout>
  );
}
