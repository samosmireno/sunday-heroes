import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeasonResponse } from "@repo/shared-types";
import { createTestProviders } from "@/test/harness";
import { seasonResponse } from "@/test/fixtures";
import { useSeasonParam } from "./use-season-param";
import { isSeasonSettling, seasonPageShell } from "./season-page-shell";

/** Seasons 1 and 2 are Past seasons; Season 3 is the Current season. */
const threeSeasons: SeasonResponse[] = [
  seasonResponse({ number: 1, endedAt: "2025-03-02T10:00:00.000Z" }),
  seasonResponse({ number: 2, endedAt: "2025-09-14T10:00:00.000Z" }),
  seasonResponse({ number: 3, endedAt: null }),
];

/** The shell's header as a page renders it, over the selection the URL and the season list give. */
function PageHeader({
  title,
  seasons,
}: {
  title?: string;
  seasons?: SeasonResponse[];
}) {
  const selection = useSeasonParam(seasons);
  const { header } = seasonPageShell(selection, {
    title,
    hasSidebar: false,
    isInfoLoading: seasons === undefined,
  });
  return <>{header}</>;
}

const seasonSelector = () => screen.queryByRole("combobox", { name: "Season" });

describe("seasonPageShell header", () => {
  it("puts the season selector beside the title once the Competition has more than one Season", () => {
    render(<PageHeader title="Zlatna lopta" seasons={threeSeasons} />, {
      wrapper: createTestProviders(),
    });

    expect(screen.getByRole("heading", { name: "Zlatna lopta" })).toBeDefined();
    expect(seasonSelector()).not.toBeNull();
  });

  it("shows no selector for a single Season", () => {
    render(<PageHeader title="Zlatna lopta" seasons={[seasonResponse()]} />, {
      wrapper: createTestProviders(),
    });

    expect(screen.getByRole("heading", { name: "Zlatna lopta" })).toBeDefined();
    expect(seasonSelector()).toBeNull();
  });

  it("shows no selector before the season list is in", () => {
    render(<PageHeader title="Zlatna lopta" />, {
      wrapper: createTestProviders(),
    });

    expect(screen.getByRole("heading", { name: "Zlatna lopta" })).toBeDefined();
    expect(seasonSelector()).toBeNull();
  });

  it("renders nothing until the page has a title", () => {
    const { container } = render(<PageHeader seasons={threeSeasons} />, {
      wrapper: createTestProviders(),
    });

    expect(container.innerHTML).toBe("");
  });
});

describe("isSeasonSettling", () => {
  it("is settling while the season list is not in, whatever the link says", () => {
    expect(
      isSeasonSettling({ season: undefined, selection: undefined }, true),
    ).toBe(true);
    expect(isSeasonSettling({ season: 2, selection: 2 }, true)).toBe(true);
  });

  it("has settled once the list is in and the link names no season", () => {
    expect(isSeasonSettling({ season: undefined, selection: 3 }, false)).toBe(
      false,
    );
  });

  it("has settled once the list is in and knows the link's season", () => {
    expect(isSeasonSettling({ season: 2, selection: 2 }, false)).toBe(false);
    expect(isSeasonSettling({ season: "all", selection: "all" }, false)).toBe(
      false,
    );
  });

  it("is still settling while the list does not know the link's season, which is about to be dropped", () => {
    expect(isSeasonSettling({ season: 9, selection: 3 }, false)).toBe(true);
  });

  it("has settled when the list read failed, so the page can show its error", () => {
    // Without a list the selection is the raw season, and nothing is loading.
    expect(isSeasonSettling({ season: 2, selection: 2 }, false)).toBe(false);
  });
});
