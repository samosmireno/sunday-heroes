/**
 * PROTOTYPE — throwaway. Issue #38.
 *
 * C — Pick an intent, not a number.
 *
 * The threshold is not a number field at all: the admin answers "who can vote
 * in this competition?" by choosing one of four cards, three of which carry a
 * preset number and state their own runway in plain words. The number is
 * revealed only behind Custom. Nothing to compute, nothing to leave empty by
 * accident — but the admin gives up fine control unless they go looking.
 */
import { UseFormReturn } from "react-hook-form";
import { CompetitionType } from "@repo/shared-types";
import { Check } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { PrototypeFormValues, readThreshold } from "./prototype-schema";
import {
  VotingPeriodField,
  ReminderDaysField,
  KnockoutPeriodField,
  NUMBER_INPUT,
  LABEL,
} from "./fields";

export const name = "Pick an intent, not a number";

export const pitch =
  "Four cards answer 'who can vote?'. Presets carry the number and state their own runway; the raw field hides behind Custom.";

const PRESETS = [
  {
    key: "everyone",
    value: undefined as number | undefined,
    title: "Everyone who played",
    blurb: "Anyone on the teamsheet votes on that match. No waiting.",
  },
  {
    key: "casual",
    value: 3,
    title: "Casual — 3 matches",
    blurb:
      "Three matches in one season earns a vote. Nothing is blocked until the competition has played 6.",
  },
  {
    key: "regulars",
    value: 5,
    title: "Regulars — 5 matches",
    blurb:
      "Five matches in one season earns a vote. Nothing is blocked until the competition has played 10.",
  },
  {
    key: "strict",
    value: 8,
    title: "Strict — 8 matches",
    blurb:
      "Eight matches in one season earns a vote. Nothing is blocked until the competition has played 16 — most of a first season.",
  },
];

function matchPreset(threshold: number | null, custom: boolean) {
  if (custom) return "custom";
  if (threshold === null) return "everyone";
  const hit = PRESETS.find((p) => p.value === threshold);
  return hit ? hit.key : "custom";
}

export function VotingOptions({
  form,
  competitionType,
}: {
  form: UseFormReturn<PrototypeFormValues>;
  competitionType: CompetitionType;
}) {
  const threshold = readThreshold(form.watch("votingThreshold"));
  // `custom` is inferred rather than stored: any number that is not a preset.
  const selected = matchPreset(
    threshold,
    threshold !== null && !PRESETS.some((p) => p.value === threshold),
  );

  const choose = (value: number | undefined) =>
    form.setValue("votingThreshold", (value ?? "") as number, {
      shouldValidate: true,
      shouldDirty: true,
    });

  return (
    <div className="ml-0 mt-2 space-y-4 rounded-lg bg-bg/20 p-3 sm:ml-7 sm:p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <VotingPeriodField form={form} />
        <ReminderDaysField form={form} />
        <KnockoutPeriodField form={form} competitionType={competitionType} />
      </div>

      <div className="space-y-3 border-t border-accent/20 pt-4">
        <div>
          <p className={LABEL}>Who can vote?</p>
          <p className="text-xs text-gray-400">
            Matches are counted{" "}
            <span className="font-semibold text-gray-300">
              within a single season
            </span>{" "}
            and never added up across seasons. Once a player qualifies, they
            keep the vote for good.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PRESETS.map((preset) => {
            const active = selected === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => choose(preset.value)}
                className={cn(
                  "flex items-start gap-2 rounded-lg border-2 p-3 text-left transition-colors",
                  active
                    ? "border-accent bg-accent/10"
                    : "border-accent/20 bg-bg/30 hover:border-accent/50",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                    active ? "border-accent bg-accent" : "border-gray-500",
                  )}
                >
                  {active && <Check className="h-3 w-3 text-bg" />}
                </span>
                <span>
                  <span
                    className={cn(
                      "block text-sm font-semibold",
                      active ? "text-accent" : "text-gray-200",
                    )}
                  >
                    {preset.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-400">
                    {preset.blurb}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <details
          className="rounded-lg border-2 border-accent/20 bg-bg/30 p-3"
          open={selected === "custom"}
        >
          <summary className="cursor-pointer text-sm font-medium text-gray-300">
            Custom number
          </summary>
          <FormField
            name="votingThreshold"
            control={form.control}
            render={({ field }) => (
              <FormItem className="mt-3 flex flex-col">
                <FormLabel className={LABEL}>
                  Matches in one season before a player can vote
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    max={50}
                    className={`${NUMBER_INPUT} max-w-[10rem]`}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
                {threshold !== null && (
                  <p className="mt-2 text-xs text-gray-400">
                    Nothing is blocked until the competition has played{" "}
                    <span className="font-semibold text-gray-300">
                      {threshold * 2} matches
                    </span>{" "}
                    and someone has reached {threshold}.
                  </p>
                )}
              </FormItem>
            )}
          />
        </details>
      </div>
    </div>
  );
}
