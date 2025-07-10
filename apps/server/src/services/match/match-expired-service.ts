import cron from "node-cron";
import { MatchService } from "./match-service";
import { AppError } from "../../utils/errors";

export const setupScheduledTasks = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running scheduled task: closeExpiredMatchVoting");
    try {
      await MatchService.closeExpiredVoting();
    } catch (error) {
      throw new AppError(
        "Error closing expired match voting",
        500,
        error instanceof Error ? error.message : "Unknown error",
        true
      );
    }
  });
};
