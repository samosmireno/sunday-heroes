import { describe, expect, it } from "vitest";
import prisma from "../src/repositories/prisma-client";
import { createUserWithDashboard } from "./factories";

// Both tests claim the same unique email. If state leaked from one test into the
// next, the second would hit a unique violation instead of seeing a single user.
const SHARED_EMAIL = "shared-admin@example.test";

describe("db test isolation", () => {
  it("starts from an empty database (first claimant of the email)", async () => {
    await createUserWithDashboard({ email: SHARED_EMAIL });

    expect(await prisma.user.count()).toBe(1);
  });

  it("starts from an empty database (second claimant of the email)", async () => {
    await createUserWithDashboard({ email: SHARED_EMAIL });

    expect(await prisma.user.count()).toBe(1);
  });
});
