import { Request } from "express";
import { describe, expect, it } from "vitest";
import { ValidationError } from "../utils/errors";
import {
  getSeasonQuery,
  matchesQuerySchema,
  seasonQuerySchema,
} from "./season-schemas";

describe("seasonQuerySchema", () => {
  it("means the Current season when absent", () => {
    expect(seasonQuerySchema.parse(undefined)).toBeUndefined();
  });

  it("reads a season number", () => {
    expect(seasonQuerySchema.parse("3")).toBe(3);
  });

  it("reads All seasons", () => {
    expect(seasonQuerySchema.parse("all")).toBe("all");
  });

  it.each(["0", "-1", "1.5", "abc", ""])("refuses %j", (value) => {
    expect(seasonQuerySchema.safeParse(value).success).toBe(false);
  });
});

describe("getSeasonQuery", () => {
  const requestWithQuery = (query: Record<string, unknown>) =>
    ({ query }) as unknown as Request;

  it("reads the season filter from the query string", () => {
    expect(getSeasonQuery(requestWithQuery({}))).toBeUndefined();
    expect(getSeasonQuery(requestWithQuery({ season: "2" }))).toBe(2);
    expect(getSeasonQuery(requestWithQuery({ season: "all" }))).toBe("all");
  });

  it("refuses a malformed season with the validation error", () => {
    expect(() => getSeasonQuery(requestWithQuery({ season: "abc" }))).toThrow(
      ValidationError,
    );
  });
});

describe("matchesQuerySchema", () => {
  it("accepts a season with a competition", () => {
    expect(
      matchesQuerySchema.parse({
        userId: "user-1",
        competitionId: "comp-1",
        season: "2",
      }),
    ).toEqual({ userId: "user-1", competitionId: "comp-1", season: 2 });
  });

  it("accepts the user-wide read without a season", () => {
    expect(matchesQuerySchema.parse({ userId: "user-1" })).toEqual({
      userId: "user-1",
    });
  });

  it("refuses a season without a competition", () => {
    expect(
      matchesQuerySchema.safeParse({ userId: "user-1", season: "2" }).success,
    ).toBe(false);
  });
});
