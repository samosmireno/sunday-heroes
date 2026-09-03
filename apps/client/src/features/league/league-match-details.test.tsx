import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Role } from "@repo/shared-types";
import { leagueMatchResponse } from "@/test/fixtures";
import LeagueMatchDetails from "./league-match-details";

const pastSeason = { number: 1, isClosed: true };
const currentSeason = { number: 2, isClosed: false };

function renderDetails(
  role: Role,
  season: { number: number; isClosed: boolean },
) {
  return render(
    <LeagueMatchDetails
      role={role}
      selectedMatch={leagueMatchResponse({ season })}
      match={null}
      isMatchCompleted={false}
      isMatchUnfinished={false}
      onEditMatch={() => {}}
      onCompleteMatch={async () => {}}
    />,
  );
}

describe("LeagueMatchDetails on a Past season's match", () => {
  it("shows a moderator the closed Season in place of Edit and Mark as Completed", () => {
    renderDetails(Role.MODERATOR, pastSeason);

    expect(screen.getByText("Season 1 · closed")).toBeDefined();
    expect(screen.queryByRole("button", { name: /edit/i })).toBeNull();
    expect(screen.queryByText("Mark as Completed")).toBeNull();
  });

  it("offers a moderator Edit and Mark as Completed on the Current season", () => {
    renderDetails(Role.MODERATOR, currentSeason);

    expect(screen.getByRole("button", { name: /edit/i })).toBeDefined();
    expect(screen.getByText("Mark as Completed")).toBeDefined();
    expect(screen.queryByText(/closed/)).toBeNull();
  });

  it("shows a player neither the actions nor the lock", () => {
    renderDetails(Role.PLAYER, pastSeason);

    expect(screen.queryByText("Season 1 · closed")).toBeNull();
    expect(screen.queryByRole("button", { name: /edit/i })).toBeNull();
  });
});
