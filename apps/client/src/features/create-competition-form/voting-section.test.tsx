import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CompetitionType } from "@repo/shared-types";
import { Form } from "@/components/ui/form";
import { createTestProviders } from "@/test/harness";
import { useCreateCompetition } from "./use-create-competition";
import { VotingSection } from "./voting-section";

/**
 * The create-competition form's real hook — its defaults, its resolver — around
 * the Voting section and the submit button the page enables from `isValid`.
 * The name and the type are the only fields the section does not own, so the
 * harness supplies them the way Basic information does.
 */
function CreateCompetitionHarness() {
  const { form, votingEnabled, competitionType } = useCreateCompetition();

  return (
    <Form {...form}>
      <input aria-label="Competition name" {...form.register("name")} />
      <button
        type="button"
        onClick={() =>
          form.setValue("type", CompetitionType.DUEL, { shouldValidate: true })
        }
      >
        Pick Duel
      </button>
      <VotingSection
        form={form}
        votingEnabled={votingEnabled}
        competitionType={competitionType}
      />
      <button type="submit" disabled={!form.formState.isValid}>
        Create Competition
      </button>
    </Form>
  );
}

const threshold = () =>
  screen.getByLabelText(/Voting Threshold/) as HTMLInputElement;
const submit = () =>
  screen.getByRole("button", {
    name: "Create Competition",
  }) as HTMLButtonElement;

/** A Duel with voting on and the two required day fields filled. */
function fillVotingDuel() {
  render(<CreateCompetitionHarness />, { wrapper: createTestProviders() });

  fireEvent.change(screen.getByLabelText("Competition name"), {
    target: { value: "Sunday Night" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Pick Duel" }));
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.change(screen.getByLabelText(/Voting Period/), {
    target: { value: "3" },
  });
  fireEvent.change(screen.getByLabelText(/Reminder To Vote/), {
    target: { value: "2" },
  });
}

describe("VotingSection: Voting Threshold", () => {
  it("starts empty, with no suggested number", () => {
    fillVotingDuel();

    expect(threshold().value).toBe("");
  });

  it("leaves the form submittable while it is empty", async () => {
    fillVotingDuel();

    await waitFor(() => expect(submit().disabled).toBe(false));
  });

  it("blocks submission on a number outside 1-50 and frees it again", async () => {
    fillVotingDuel();

    fireEvent.change(threshold(), { target: { value: "0" } });
    await waitFor(() => expect(submit().disabled).toBe(true));

    fireEvent.change(threshold(), { target: { value: "51" } });
    await waitFor(() => expect(submit().disabled).toBe(true));

    fireEvent.change(threshold(), { target: { value: "5" } });
    await waitFor(() => expect(submit().disabled).toBe(false));

    fireEvent.change(threshold(), { target: { value: "" } });
    await waitFor(() => expect(submit().disabled).toBe(false));
  });
});
