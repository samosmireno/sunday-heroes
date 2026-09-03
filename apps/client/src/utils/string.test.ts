import { describe, expect, it } from "vitest";
import { capitalizeFirstLetter, convertMatchType } from "./string";

describe("convertMatchType", () => {
  it("turns a match type value into its display name", () => {
    expect(convertMatchType("FIVE_A_SIDE")).toBe("Five-A-Side");
  });

  it("returns an empty string when there is no match type", () => {
    expect(convertMatchType("")).toBe("");
  });
});

describe("capitalizeFirstLetter", () => {
  it("capitalizes each word and lowercases the rest", () => {
    expect(capitalizeFirstLetter("sunday HEROES")).toBe("Sunday Heroes");
  });
});
