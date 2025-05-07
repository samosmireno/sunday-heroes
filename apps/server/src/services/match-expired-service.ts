import { MatchRepo } from "../repositories/match-repo";
import cron from "node-cron";

export const setupScheduledTasks = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running scheduled task: closeExpiredMatchVoting");
    try {
      await MatchRepo.closeExpiredMatchVoting();
    } catch (error) {
      console.log("Scheduled task failed:", error);
    }
  });
};
