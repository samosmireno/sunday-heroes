/**
 * PROTOTYPE — throwaway. Issue #38.
 *
 * A copy of VotingSection whose options sub-panel comes from the active
 * variant. Everything above it — the heading and the Voting checkbox — is the
 * real thing, unchanged.
 */
import { UseFormReturn } from "react-hook-form";
import { CompetitionType } from "@repo/shared-types";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { PrototypeFormValues } from "./prototype-schema";

interface Props {
  form: UseFormReturn<PrototypeFormValues>;
  votingEnabled: boolean;
  competitionType: CompetitionType;
  VotingOptions: (props: {
    form: UseFormReturn<PrototypeFormValues>;
    competitionType: CompetitionType;
  }) => JSX.Element;
}

export function PrototypeVotingSection({
  form,
  votingEnabled,
  competitionType,
  VotingOptions,
}: Props) {
  return (
    <div>
      <h3 className="mb-3 border-b border-accent/30 pb-2 text-base font-medium text-gray-200 sm:mb-4 sm:text-lg">
        Additional Options
      </h3>
      <div className="space-y-4">
        <FormField
          name="votingEnabled"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="border-accent text-accent"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-medium text-gray-300">
                  Voting
                </FormLabel>
                <FormDescription className="mt-2 text-xs text-gray-400">
                  After each match, players receive an email to vote for the 3
                  best players.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {votingEnabled && (
          <VotingOptions form={form} competitionType={competitionType} />
        )}
      </div>
    </div>
  );
}
