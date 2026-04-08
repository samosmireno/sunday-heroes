import cron from "node-cron";
import { MatchService } from "./match-service";
import { AppError } from "../../utils/errors";
import { MatchVotingService } from "./match-voting-service";
import logger from "../../logger";

export const setupScheduledTasks = () => {
  cron.schedule("0 0 * * *", async () => {
    logger.info("Running scheduled task: closeExpiredMatchVoting");
    try {
      await MatchService.closeExpiredVoting();
    } catch (error) {
      throw new AppError(
        "Error closing expired match voting",
        500,
        error instanceof Error ? error.message : "Unknown error",
        true,
      );
    }
  });

  cron.schedule("00 12 * * *", async () => {
    logger.info("Running scheduled task: sendReminderEmails");
    try {
      await MatchVotingService.sendReminderEmails();
    } catch (error) {
      throw new AppError(
        "Error sending reminder emails",
        500,
        error instanceof Error ? error.message : "Unknown error",
        true,
      );
    }
  });
};
