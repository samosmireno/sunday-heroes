import cron from "node-cron";
import { MatchService } from "./match-service";

export const setupScheduledTasks = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running scheduled task: closeExpiredMatchVoting");
    try {
      await MatchService.closeExpiredVoting();
    } catch (error) {
      console.log("Scheduled task failed:", error);
    }
  });
};
