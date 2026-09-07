/**
 * PROTOTYPE — throwaway. Issue #38: how an admin sets the Voting threshold and
 * learns about the runway.
 *
 * Three variants of the voting options panel, switchable via `?variant=` on
 * `/prototype/voting-threshold`. The rest of the create-competition form is the
 * real thing — Basic Information and the actions bar are imported from
 * `features/create-competition-form/` — so the field is judged at the real
 * page's density rather than in a vacuum.
 *
 * Public route, no login and no server: submitting does nothing but print the
 * request the real form would have posted.
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompetitionType, MatchType } from "@repo/shared-types";
import { Form } from "@/components/ui/form";
import Header from "@/components/ui/header";
import PrototypeSwitcher from "@/components/prototype-switcher";
import { BasicInformationSection } from "@/features/create-competition-form/basic-information-section";
import { FormActions } from "@/features/create-competition-form/form-actions";
import { CreateCompetitionFormValues } from "@/features/create-competition-form/create-competition-schema";
import { PrototypeVotingSection } from "@/features/create-competition-form/prototype-voting-threshold/prototype-voting-section";
import {
  PrototypeFormSchema,
  PrototypeFormValues,
  readThreshold,
} from "@/features/create-competition-form/prototype-voting-threshold/prototype-schema";
import * as A from "@/features/create-competition-form/prototype-voting-threshold/variant-a";
import * as B from "@/features/create-competition-form/prototype-voting-threshold/variant-b";
import * as C from "@/features/create-competition-form/prototype-voting-threshold/variant-c";
import { UseFormReturn } from "react-hook-form";

const VARIANTS = { A, B, C };
const KEYS = Object.keys(VARIANTS);
const NAMES = Object.fromEntries(
  Object.entries(VARIANTS).map(([k, v]) => [k, v.name]),
);

export default function PrototypeVotingThresholdPage() {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("variant") ?? "A";
  const variant = VARIANTS[key as keyof typeof VARIANTS] ?? A;
  const [submitted, setSubmitted] = useState<string | null>(null);

  const form = useForm<PrototypeFormValues>({
    resolver: zodResolver(PrototypeFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "Thursday Night League",
      type: CompetitionType.LEAGUE,
      votingEnabled: true,
      votingPeriodDays: 3,
      reminderDays: 2,
      // Empty-string default, matching the real form: keeps the input controlled.
      votingThreshold: "" as unknown as number,
      numberOfTeams: 4,
      matchType: MatchType.FIVE_A_SIDE,
      isRoundRobin: false,
    },
  });

  const votingEnabled = form.watch("votingEnabled");
  const competitionType = form.watch("type");
  const threshold = readThreshold(form.watch("votingThreshold"));

  return (
    <div className="min-h-screen flex-1 overflow-x-hidden bg-bg p-3 pb-36 sm:p-4 md:p-6">
      <Header
        title={`Prototype — ${key} · ${variant.name}`}
        subtitle={variant.pitch}
        hasSidebar={false}
      />

      <div className="relative grid grid-cols-1 gap-4 sm:gap-6">
        <div className="rounded-lg border-2 border-accent bg-panel-bg p-4 shadow-lg sm:p-6">
          <div className="mb-4 flex items-center sm:mb-6">
            <h2 className="text-lg font-bold text-accent sm:text-xl">
              Competition Details
            </h2>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) =>
                setSubmitted(JSON.stringify(values, null, 2)),
              )}
              className="space-y-6"
            >
              <BasicInformationSection
                form={
                  form as unknown as UseFormReturn<CreateCompetitionFormValues>
                }
                competitionType={competitionType}
              />
              <PrototypeVotingSection
                form={form}
                votingEnabled={votingEnabled}
                competitionType={competitionType}
                VotingOptions={variant.VotingOptions}
              />
              <FormActions
                isFormValid={form.formState.isValid}
                onCancel={() => setSubmitted(null)}
              />
            </form>
          </Form>
        </div>

        {/* PROTOTYPE — the state readout, not part of the design being judged. */}
        <div className="rounded-lg border-2 border-dashed border-gray-600 bg-black/30 p-4 text-sm text-gray-300">
          <p className="mb-2 font-semibold uppercase tracking-wide text-gray-400">
            What the form currently means
          </p>
          {threshold === null ? (
            <p>
              <span className="text-gray-100">votingThreshold: null</span> —
              every player who played a match can vote on it.
            </p>
          ) : (
            <p>
              <span className="text-gray-100">
                votingThreshold: {threshold}
              </span>{" "}
              — a player qualifies at {threshold} completed matches inside one
              season; the gate arms once the competition has {threshold * 2}{" "}
              completed matches and at least one player has qualified.
            </p>
          )}
          {submitted && (
            <pre className="mt-3 overflow-x-auto rounded bg-black/50 p-3 text-xs text-emerald-300">
              {submitted}
            </pre>
          )}
        </div>
      </div>

      <PrototypeSwitcher variants={KEYS} names={NAMES} current={key} />
    </div>
  );
}
