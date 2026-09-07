/**
 * PROTOTYPE — throwaway. Issue #38.
 *
 * B — Own row with a live runway readout.
 *
 * The threshold breaks out of the grid onto its own full-width row, and typing
 * a number renders the consequences live: the derived runway (2X), a bar that
 * shows the runway against the gate, the per-season rule spelled out with the
 * admin's own number, and a warning when the runway swallows a whole season.
 * The admin never computes 2X themselves.
 */
import { UseFormReturn } from "react-hook-form";
import { CompetitionType } from "@repo/shared-types";
import { Lock, LockOpen, TriangleAlert } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PrototypeFormValues, readThreshold } from "./prototype-schema";
import {
  VotingPeriodField,
  ReminderDaysField,
  KnockoutPeriodField,
  NUMBER_INPUT,
  LABEL,
} from "./fields";

export const name = "Live runway readout";

export const pitch =
  "Own row, derived numbers shown live: the runway (2X) is computed for the admin, the per-season rule is restated with their number, and a long runway warns.";

/** A season of a real Sunday league — used only to size the warning. */
const TYPICAL_SEASON_MATCHES = 20;

function RunwayReadout({ threshold }: { threshold: number | null }) {
  if (threshold === null) {
    return (
      <div className="mt-3 rounded-lg border-2 border-accent/20 bg-bg/30 p-3">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <LockOpen className="h-4 w-4 shrink-0 text-gray-400" />
          <span>
            <span className="font-semibold text-gray-200">No threshold.</span>{" "}
            Everyone who played a match can vote on it, from the first match
            onwards.
          </span>
        </div>
      </div>
    );
  }

  const runway = threshold * 2;
  const runwayIsLong = runway > TYPICAL_SEASON_MATCHES;

  return (
    <div className="mt-3 space-y-3 rounded-lg border-2 border-accent/20 bg-bg/30 p-3">
      <div className="flex items-center gap-2 text-sm text-gray-300">
        <Lock className="h-4 w-4 shrink-0 text-accent" />
        <span>
          A player who plays{" "}
          <span className="font-semibold text-accent">{threshold}</span> matches
          in <span className="font-semibold text-accent">one season</span> can
          vote &mdash; in that season and every season after it. Matches do not
          add up across seasons: {threshold - 1} last season and {threshold - 1}{" "}
          this season is still not enough.
        </span>
      </div>

      <div>
        <div className="flex h-6 w-full overflow-hidden rounded-md border border-accent/30">
          <div
            className="flex items-center justify-center bg-gray-600/40 text-[11px] font-medium text-gray-300"
            style={{ width: "55%" }}
          >
            matches 1&ndash;{runway}
          </div>
          <div className="flex flex-1 items-center justify-center bg-accent/30 text-[11px] font-medium text-accent">
            match {runway + 1} onwards
          </div>
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-gray-400">
          <span>Everyone votes &mdash; nothing is blocked yet</span>
          <span className="text-accent">Threshold applies</span>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Voting is open to everyone for the first{" "}
        <span className="font-semibold text-gray-300">
          {runway} completed matches
        </span>{" "}
        of this competition, and until at least one player has reached{" "}
        {threshold}. That is not a bug &mdash; it is how a brand new competition
        gets its first regulars.
      </p>

      {runwayIsLong && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-950/20 p-2">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-xs text-amber-300/90">
            {runway} matches is most of a season, or more. Nothing at all will
            be blocked for that long &mdash; consider a smaller number.
          </p>
        </div>
      )}
    </div>
  );
}

export function VotingOptions({
  form,
  competitionType,
}: {
  form: UseFormReturn<PrototypeFormValues>;
  competitionType: CompetitionType;
}) {
  const threshold = readThreshold(form.watch("votingThreshold"));

  return (
    <div className="ml-0 mt-2 space-y-4 rounded-lg bg-bg/20 p-3 sm:ml-7 sm:p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <VotingPeriodField form={form} />
        <ReminderDaysField form={form} />
        <KnockoutPeriodField form={form} competitionType={competitionType} />
      </div>

      <div className="border-t border-accent/20 pt-4">
        <FormField
          name="votingThreshold"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className={LABEL}>
                Voting Threshold{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={1}
                  max={50}
                  placeholder="Leave empty &mdash; anyone who played can vote"
                  className={`${NUMBER_INPUT} max-w-xs`}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        <RunwayReadout threshold={threshold} />
      </div>
    </div>
  );
}
