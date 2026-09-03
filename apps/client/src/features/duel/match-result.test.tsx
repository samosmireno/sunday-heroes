import { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MatchSeason, Role } from "@repo/shared-types";
import { createTestProviders } from "@/test/harness";
import { competitionResponse } from "@/test/fixtures";
import { CompetitionProvider } from "@/context/competition-context";
import MatchResult from "./match-result";

const pastSeason: MatchSeason = { number: 1, isClosed: true };
const currentSeason: MatchSeason = { number: 2, isClosed: false };

/** The competition page's context around a card: a Duel on its Current season. */
function createCardProviders() {
  const Providers = createTestProviders();
  return ({ children }: { children: ReactNode }) => (
    <Providers>
      <CompetitionProvider
        value={{
          competition: competitionResponse(),
          isLoading: false,
          refetch: () => {},
          season: undefined,
          selection: undefined,
          current: 2,
          seasons: [],
          selectedSeason: undefined,
          selectedMatchCount: undefined,
          isPast: false,
          isAll: false,
          showSelector: false,
        }}
      >
        {children}
      </CompetitionProvider>
    </Providers>
  );
}

function renderCard(userRole: Role, season: MatchSeason) {
  return render(
    <MatchResult
      matchId="match-1"
      date="2026-01-10"
      homeScore={2}
      awayScore={1}
      isSelectedMatch
      refetchMatches={() => {}}
      userRole={userRole}
      season={season}
    />,
    { wrapper: createCardProviders() },
  );
}

describe("MatchResult on a Past season's match", () => {
  it("shows an admin the closed Season in place of the pencil and bin", () => {
    renderCard(Role.ADMIN, pastSeason);

    expect(screen.getByText("Season 1 · closed")).toBeDefined();
    expect(screen.queryByRole("link", { name: "Edit match" })).toBeNull();
    expect(screen.queryByLabelText("Delete match")).toBeNull();
  });

  it("offers an admin the pencil and bin on the Current season", () => {
    renderCard(Role.ADMIN, currentSeason);

    expect(screen.getByRole("link", { name: "Edit match" })).toBeDefined();
    expect(screen.getByLabelText("Delete match")).toBeDefined();
    expect(screen.queryByText(/closed/)).toBeNull();
  });

  it("shows a player neither the actions nor the lock", () => {
    renderCard(Role.PLAYER, pastSeason);

    expect(screen.queryByText("Season 1 · closed")).toBeNull();
    expect(screen.queryByRole("link", { name: "Edit match" })).toBeNull();
  });
});
