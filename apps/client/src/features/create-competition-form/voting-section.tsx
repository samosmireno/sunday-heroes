// components/features/create-competition-form/voting-section.tsx
import { UseFormReturn } from "react-hook-form";
import { CompetitionType } from "@repo/shared-types";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { CreateCompetitionFormValues } from "./create-competition-schema";

interface VotingSectionProps {
  form: UseFormReturn<CreateCompetitionFormValues>;
  votingEnabled: boolean;
  competitionType: CompetitionType;
}

export function VotingSection({
  form,
  votingEnabled,
  competitionType,
}: VotingSectionProps) {
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
          <VotingOptionsSection form={form} competitionType={competitionType} />
        )}
      </div>
    </div>
  );
}

function VotingOptionsSection({
  form,
  competitionType,
}: {
  form: UseFormReturn<CreateCompetitionFormValues>;
  competitionType: CompetitionType;
}) {
  return (
    <div className="ml-0 mt-2 rounded-lg bg-bg/20 p-3 sm:ml-7 sm:p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormField
          name="votingPeriodDays"
          control={form.control}
          shouldUnregister={true}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                Voting Period (Days)
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  defaultValue={field.value ?? 3}
                  className="w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 no-spinner focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-400">
                Number of days players can vote after a match is added.
              </FormDescription>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          name="reminderDays"
          control={form.control}
          shouldUnregister={true}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                Reminder To Vote (Days)
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  defaultValue={field.value ?? 2}
                  className="w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 no-spinner focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-400">
                Send a reminder email if players haven’t voted after X days.
                (Recommended: 1 day before voting period ends)
              </FormDescription>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        {competitionType === CompetitionType.KNOCKOUT && (
          <FormField
            name="knockoutVotingPeriodDays"
            control={form.control}
            shouldUnregister={true}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="mb-1 block text-sm font-medium text-gray-300">
                  Knockout Voting Period (Days)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    className="w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 no-spinner focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}
