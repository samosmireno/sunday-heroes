import { afterEach, describe, expect, it, vi } from "vitest";
import cron from "node-cron";
import { config } from "../../config/config";
import { setupScheduledTasks } from "./match-expired-service";

vi.mock("node-cron", () => ({ default: { schedule: vi.fn() } }));

afterEach(() => {
  config.readOnly = false;
  vi.mocked(cron.schedule).mockClear();
});

describe("setupScheduledTasks", () => {
  it("schedules the vote-close and reminder jobs", () => {
    setupScheduledTasks();

    expect(vi.mocked(cron.schedule).mock.calls.map(([when]) => when)).toEqual([
      "0 0 * * *",
      "00 12 * * *",
    ]);
  });

  it("schedules nothing while the app is read-only", () => {
    config.readOnly = true;

    setupScheduledTasks();

    expect(cron.schedule).not.toHaveBeenCalled();
  });
});
