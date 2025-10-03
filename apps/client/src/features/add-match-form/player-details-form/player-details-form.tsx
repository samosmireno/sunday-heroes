import { useMultiStepFormContext } from "../../multi-step-form/multi-step-form-context";
import { Form, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import TeamInputStats from "./team-input-stats";
import { Team } from "@repo/shared-types";
import FormLayout from "../form-layout";
import { DuelFormData } from "../schemas/types";

interface PlayerDetailsFormProps {
  isEdited: boolean;
}

export default function PlayerDetailsForm({
  isEdited,
}: PlayerDetailsFormProps) {
  const { form, prevStep, isStepValid, checkFinalValid } =
    useMultiStepFormContext();
  const data: DuelFormData = form.getValues();

  return (
    <FormLayout title="Add player stats">
      <Form {...form}>
        <div className="mx-auto flex w-4/5 flex-col space-y-6 sm:space-y-8 xl:w-3/5">
          <TeamInputStats team={Team.HOME} formData={data} form={form} />
          <TeamInputStats team={Team.AWAY} formData={data} form={form} />
        </div>
        <div className="mt-4 flex justify-center px-4 sm:px-6">
          {!checkFinalValid() && (
            <FormMessage className="bg-muted/50 rounded-md text-center">
              <p className="text-muted-foreground text-sm">
                Player stats cannot exceed team totals.
              </p>
            </FormMessage>
          )}
        </div>
        <div className="mt-8 flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="rounded-lg border-2 border-accent/50 bg-transparent px-4 py-2 font-bold text-gray-300 transition-all hover:bg-accent/10"
          >
            Previous
          </Button>
          <Button
            type={"submit"}
            className="transform rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 font-bold text-accent shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-accent/30"
            disabled={!isStepValid()}
          >
            {isEdited ? "Save Changes" : "Submit"}
          </Button>
        </div>
      </Form>
    </FormLayout>
  );
}
