/**
 * PROTOTYPE — throwaway. Issue #38.
 *
 * The two voting fields that already exist and are identical in every variant.
 * Only the threshold differs between variants, so only the threshold is written
 * three times.
 */
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CompetitionType } from "@repo/shared-types";
import { PrototypeFormValues } from "./prototype-schema";

export const NUMBER_INPUT =
  "w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-1.5 text-gray-200 no-spinner focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:py-2";

export const LABEL = "mb-1 block text-sm font-medium text-gray-300";

export function VotingPeriodField({
  form,
}: {
  form: UseFormReturn<PrototypeFormValues>;
}) {
  return (
    <FormField
      name="votingPeriodDays"
      control={form.control}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className={LABEL}>Voting Period (Days)</FormLabel>
          <FormControl>
            <Input {...field} type="number" min={0} className={NUMBER_INPUT} />
          </FormControl>
          <FormDescription className="text-xs text-gray-400">
            Number of days players can vote after a match is added.
          </FormDescription>
          <FormMessage className="text-red-400" />
        </FormItem>
      )}
    />
  );
}

export function ReminderDaysField({
  form,
}: {
  form: UseFormReturn<PrototypeFormValues>;
}) {
  return (
    <FormField
      name="reminderDays"
      control={form.control}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className={LABEL}>Reminder To Vote (Days)</FormLabel>
          <FormControl>
            <Input {...field} type="number" min={0} className={NUMBER_INPUT} />
          </FormControl>
          <FormDescription className="text-xs text-gray-400">
            Send a reminder email if players haven&rsquo;t voted after X days.
            (Recommended: 1 day before voting period ends)
          </FormDescription>
          <FormMessage className="text-red-400" />
        </FormItem>
      )}
    />
  );
}

export function KnockoutPeriodField({
  form,
  competitionType,
}: {
  form: UseFormReturn<PrototypeFormValues>;
  competitionType: CompetitionType;
}) {
  if (competitionType !== CompetitionType.KNOCKOUT) return null;
  return (
    <FormField
      name="knockoutVotingPeriodDays"
      control={form.control}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className={LABEL}>
            Knockout Voting Period (Days)
          </FormLabel>
          <FormControl>
            <Input {...field} type="number" min={0} className={NUMBER_INPUT} />
          </FormControl>
          <FormMessage className="text-red-400" />
        </FormItem>
      )}
    />
  );
}
