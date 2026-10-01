import cron from "node-cron";
import { MatchService } from "./match-service";
import { AppError } from "../../utils/errors";
import { MatchVotingService } from "./match-voting-service";
import logger from "../../logger";
import { config } from "../../config/config";

export const setupScheduledTasks = () => {
  // A frozen copy must neither close a vote nor send a reminder mail. The flag
  // is read at boot, and a Render env change restarts the service.
  if (config.readOnly) {
    logger.info(
      "READ_ONLY: scheduled tasks are off (closeExpiredMatchVoting, sendReminderEmails)",
    );
    return;
  }

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
