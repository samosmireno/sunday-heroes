/**
 * PROTOTYPE — throwaway. Issue #38.
 *
 * A — Third number in the grid.
 *
 * The threshold is treated exactly like Voting Period and Reminder days: a
 * number input in the same grid, empty by default, with the runway explained
 * only by static description text. No derived numbers, no live feedback.
 * This is the honest baseline — if it is good enough, the other two are
 * over-engineering.
 */
import { UseFormReturn } from "react-hook-form";
import { CompetitionType } from "@repo/shared-types";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PrototypeFormValues } from "./prototype-schema";
import {
  VotingPeriodField,
  ReminderDaysField,
  KnockoutPeriodField,
  NUMBER_INPUT,
  LABEL,
} from "./fields";

export const name = "Third number in the grid";

export const pitch =
  "The threshold is just another number field. Bounds 1–50, empty means no threshold, and the runway is a sentence in the description that never changes.";

export function VotingOptions({
  form,
  competitionType,
}: {
  form: UseFormReturn<PrototypeFormValues>;
  competitionType: CompetitionType;
}) {
  return (
    <div className="ml-0 mt-2 rounded-lg bg-bg/20 p-3 sm:ml-7 sm:p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <VotingPeriodField form={form} />
        <ReminderDaysField form={form} />
        <KnockoutPeriodField form={form} competitionType={competitionType} />

        <FormField
          name="votingThreshold"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className={LABEL}>Matches Before Voting</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={1}
                  max={50}
                  placeholder="No limit"
                  className={NUMBER_INPUT}
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-400">
                Matches a player must play in a single season before they can
                vote. Leave empty to let anyone who played vote. Voting stays
                open to everyone until the competition has played twice this
                many matches.
              </FormDescription>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
