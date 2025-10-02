import { CreateCompetitionFormValues } from "../features/create-competition-form/create-competition-schema";
import { Form } from "../components/ui/form";
import { GuideBox } from "../components/ui/guide-box";
import Header from "../components/ui/header";
import SubmitSpinner from "@/components/ui/submit-spinner";
import { useCreateCompetition } from "@/features/create-competition-form/use-create-competition";
import { BasicInformationSection } from "@/features/create-competition-form/basic-information-section";
import { VotingSection } from "@/features/create-competition-form/voting-section";
import { FormActions } from "@/features/create-competition-form/form-actions";

const CreateCompetitionForm = () => {
  const {
    form,
    votingEnabled,
    competitionType,
    isSubmitting,
    handleSubmit,
    handleCancel,
  } = useCreateCompetition();

  const onSubmit = (values: CreateCompetitionFormValues) => {
    handleSubmit(values);
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
      {isSubmitting && <SubmitSpinner text="Creating Competition..." />}

      <Header title="Create Competition" hasSidebar={true} />
      <div className="relative grid grid-cols-1 gap-4 sm:gap-6">
        <div className="rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg sm:p-6">
          <div className="mb-4 flex items-center sm:mb-6">
            <h2 className="text-lg font-bold text-accent sm:text-xl">
              Competition Details
            </h2>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <BasicInformationSection
                form={form}
                competitionType={competitionType}
              />
              <VotingSection
                form={form}
                votingEnabled={votingEnabled}
                competitionType={competitionType}
              />
              <FormActions
                isFormValid={form.formState.isValid}
                onCancel={handleCancel}
              />
            </form>
          </Form>
        </div>

        <GuideBox title="Quick Start Guide">
          <p>After creating your competition, you'll need to:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Name teams in your competition</li>
            <li>Add players to teams</li>
            <li>Schedule matches</li>
          </ul>
        </GuideBox>
      </div>
    </div>
  );
};

export default CreateCompetitionForm;
