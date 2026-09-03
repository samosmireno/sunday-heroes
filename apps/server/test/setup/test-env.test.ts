import { describe, expect, it } from "vitest";
import { assertLocalDatabaseUrl } from "./test-env";

const LOCAL_URL =
  "postgresql://postgres:postgres@localhost:5433/sunday_heroes_test";

describe("assertLocalDatabaseUrl", () => {
  it("accepts a localhost URL", () => {
    expect(assertLocalDatabaseUrl(LOCAL_URL)).toBe(LOCAL_URL);
  });

  it("accepts a 127.0.0.1 URL", () => {
    const url =
      "postgresql://postgres:postgres@127.0.0.1:5432/sunday_heroes_test";

    expect(assertLocalDatabaseUrl(url)).toBe(url);
  });

  it("refuses a remote host", () => {
    expect(() =>
      assertLocalDatabaseUrl(
        "postgresql://user:secret@db.example.com:5432/prod",
      ),
    ).toThrow(/localhost or 127\.0\.0\.1/);
  });

  it("refuses a host that merely starts with localhost", () => {
    expect(() =>
      assertLocalDatabaseUrl(
        "postgresql://user:secret@localhost.example.com/prod",
      ),
    ).toThrow(/localhost or 127\.0\.0\.1/);
  });

  it("names the compose command when the URL is unset", () => {
    expect(() => assertLocalDatabaseUrl(undefined)).toThrow(
      /docker compose up -d/,
    );
  });
});
