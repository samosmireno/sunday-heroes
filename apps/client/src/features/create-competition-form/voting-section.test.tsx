import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CompetitionType, MatchType } from "@repo/shared-types";
import { Form } from "@/components/ui/form";
import { createTestProviders } from "@/test/harness";
import { CreateCompetitionFormValues } from "./create-competition-schema";
import { useCreateCompetition } from "./use-create-competition";
import { VotingSection } from "./voting-section";

/**
 * The create-competition form's real hook — its defaults, its resolver — around
 * the Voting section and the submit button the page enables from `isValid`.
 * The name and the type are the only fields the section does not own, so the
 * harness supplies them the way Basic information does; the League settings two
 * sections up are supplied the same way, because the threshold's ceiling line is
 * derived from them.
 */
function CreateCompetitionHarness({
  onSubmit,
}: {
  onSubmit?: (values: CreateCompetitionFormValues) => void;
}) {
  const { form, votingEnabled, competitionType } = useCreateCompetition();

  return (
    <Form {...form}>
      <div>
        <input aria-label="Competition name" {...form.register("name")} />
        <button
          type="button"
          onClick={() =>
            form.setValue("type", CompetitionType.DUEL, {
              shouldValidate: true,
            })
          }
        >
          Pick Duel
        </button>
        <button
          type="button"
          onClick={() => {
            form.setValue("type", CompetitionType.LEAGUE, {
              shouldValidate: true,
            });
            form.setValue("matchType", MatchType.FIVE_A_SIDE, {
              shouldValidate: true,
            });
          }}
        >
          Pick League
        </button>
        <input
          aria-label="Number of teams"
          {...form.register("numberOfTeams")}
        />
        <button
          type="button"
          onClick={() =>
            form.setValue("isRoundRobin", true, { shouldValidate: true })
          }
        >
          Play each other twice
        </button>
        <VotingSection
          form={form}
          votingEnabled={votingEnabled}
          competitionType={competitionType}
        />
        <button type="submit" disabled={!form.formState.isValid}>
          Create Competition
        </button>
        {/*
          The page submits through `form.handleSubmit`, which revalidates the
          whole schema before it hands the values on. A real <form> element is
          not usable here: Radix renders a hidden bubble input for a checkbox
          inside one, and that wants a ResizeObserver jsdom has not got.
        */}
        <button
          type="button"
          onClick={() => void form.handleSubmit((v) => onSubmit?.(v))()}
        >
          Submit
        </button>
      </div>
    </Form>
  );
}

const threshold = () =>
  screen.getByLabelText(/Voting Threshold/) as HTMLInputElement;
const submit = () =>
  screen.getByRole("button", {
    name: "Create Competition",
  }) as HTMLButtonElement;

/**
 * The name goes in before the type is picked, the way an admin fills the form
 * from the top: react-hook-form leaves `isValid` stale if the first validated
 * change lands while a required field above it is still empty.
 */
function fillName() {
  fireEvent.change(screen.getByLabelText("Competition name"), {
    target: { value: "Sunday Night" },
  });
}

function enableVoting() {
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.change(screen.getByLabelText(/Voting Period/), {
    target: { value: "3" },
  });
  fireEvent.change(screen.getByLabelText(/Reminder To Vote/), {
    target: { value: "2" },
  });
}

/** A Duel with voting on and the two required day fields filled. */
function fillVotingDuel() {
  render(<CreateCompetitionHarness />, { wrapper: createTestProviders() });

  fillName();
  fireEvent.click(screen.getByRole("button", { name: "Pick Duel" }));
  enableVoting();
}

/** A League of `teams` teams, with voting on and everything else it needs. */
function fillVotingLeague(
  teams: number,
  onSubmit?: (values: CreateCompetitionFormValues) => void,
) {
  render(<CreateCompetitionHarness onSubmit={onSubmit} />, {
    wrapper: createTestProviders(),
  });

  fillName();
  fireEvent.click(screen.getByRole("button", { name: "Pick League" }));
  fireEvent.change(screen.getByLabelText("Number of teams"), {
    target: { value: String(teams) },
  });
  enableVoting();
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

describe("VotingSection: the threshold readout", () => {
  it("states the off-state positively while the field is empty", () => {
    fillVotingDuel();

    expect(
      screen.getByText(
        /No threshold\. Everyone who played a match can vote on it, from the first match onwards\./,
      ),
    ).toBeTruthy();
  });

  it("restates the per-season rule with the admin's own number", () => {
    fillVotingDuel();

    fireEvent.change(threshold(), { target: { value: "5" } });

    expect(
      screen.getByText(/A player who plays 5 matches in one season can vote/),
    ).toBeTruthy();
    expect(
      screen.getByText(
        /Matches do not add up across seasons: 4 last season and 4 this season is still not enough\./,
      ),
    ).toBeTruthy();
  });

  it("derives the runway bar as twice the threshold", () => {
    fillVotingDuel();

    fireEvent.change(threshold(), { target: { value: "5" } });
    expect(screen.getByText(/Matches 1–10 · everyone votes/)).toBeTruthy();
    expect(
      screen.getByText(/Match 11 onwards · threshold applies/),
    ).toBeTruthy();

    fireEvent.change(threshold(), { target: { value: "3" } });
    expect(screen.getByText(/Matches 1–6 · everyone votes/)).toBeTruthy();
    expect(
      screen.getByText(/Match 7 onwards · threshold applies/),
    ).toBeTruthy();
  });

  it("spells out the whole arming condition, qualified player included", () => {
    fillVotingDuel();

    fireEvent.change(threshold(), { target: { value: "5" } });

    expect(
      screen.getByText(
        /the competition has at least 10 completed matches in total, across every season, and at least one player has reached 5 in a single season/,
      ),
    ).toBeTruthy();
    expect(screen.getByText(/deliberate, not a bug/)).toBeTruthy();
  });

  it("says nothing at all about a threshold above the allowed maximum", () => {
    fillVotingDuel();

    fireEvent.change(threshold(), { target: { value: "51" } });

    // Neither readout: the field is refusing 51, and the off-state sentence
    // would tell the admin everyone can vote while the form disagrees.
    expect(screen.queryByText(/No threshold\./)).toBeNull();
    expect(screen.queryByText(/Matches 1–102/)).toBeNull();
  });

  it("goes back to the off-state sentence when the field is cleared", () => {
    fillVotingDuel();

    fireEvent.change(threshold(), { target: { value: "5" } });
    expect(screen.queryByText(/No threshold\./)).toBeNull();

    fireEvent.change(threshold(), { target: { value: "" } });
    expect(screen.getByText(/No threshold\./)).toBeTruthy();
    expect(screen.queryByText(/Matches 1–10/)).toBeNull();
  });

  it("drops the pooling example at a threshold of one, where it would read as zero", () => {
    fillVotingDuel();

    fireEvent.change(threshold(), { target: { value: "1" } });

    expect(
      screen.getByText(/A player who plays 1 match in one season can vote/),
    ).toBeTruthy();
    expect(
      screen.queryByText(/Matches do not add up across seasons/),
    ).toBeNull();
  });
});

describe("VotingSection: the League ceiling line", () => {
  it("states the ceiling as fact for a single round robin", () => {
    fillVotingLeague(4);

    fireEvent.change(threshold(), { target: { value: "3" } });

    const line = screen.getByText(
      /With 4 teams, a player can play at most 3 matches in a season\./,
    );
    expect(line.className).toContain("text-gray-400");
    expect(line.className).not.toContain("amber");
  });

  it("doubles the ceiling when the teams play each other twice", () => {
    fillVotingLeague(4);

    fireEvent.change(threshold(), { target: { value: "5" } });
    fireEvent.click(
      screen.getByRole("button", { name: "Play each other twice" }),
    );

    expect(
      screen.getByText(
        /With 4 teams playing each other twice, a player can play at most 6 matches in a season\./,
      ),
    ).toBeTruthy();
  });

  it("turns amber when the threshold is above the ceiling", () => {
    fillVotingLeague(4);

    fireEvent.change(threshold(), { target: { value: "5" } });

    const line = screen.getByText(
      /With 4 teams, a player can play at most 3 matches in a season\./,
    );
    expect(line.className).toContain("text-amber-400");
    expect(
      screen.getByText(
        /A threshold of 5 is above that, so a player who stays on one team never reaches it/,
      ),
    ).toBeTruthy();
  });

  it("still lets the form submit with a threshold above the ceiling", async () => {
    const onSubmit = vi.fn();
    fillVotingLeague(4, onSubmit);

    fireEvent.change(threshold(), { target: { value: "50" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    // The resolver lets it through: no error on the field, and no dialog or
    // checkbox standing between the admin and the competition.
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      votingThreshold: 50,
      numberOfTeams: 4,
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("checkbox", { name: /threshold/i })).toBeNull();
  });

  it("waits for a team count before stating anything", () => {
    fillVotingLeague(4);

    fireEvent.change(screen.getByLabelText("Number of teams"), {
      target: { value: "" },
    });
    fireEvent.change(threshold(), { target: { value: "5" } });

    expect(screen.queryByText(/can play at most/)).toBeNull();
  });

  it("shows a Duel no ceiling at all", () => {
    fillVotingDuel();

    fireEvent.change(threshold(), { target: { value: "50" } });

    expect(screen.queryByText(/can play at most/)).toBeNull();
    expect(screen.queryByText(/teams/)).toBeNull();
  });
});
