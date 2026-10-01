import app from "./app";
import { config } from "./config/config";
import { setupScheduledTasks } from "./services/match/match-expired-service";
import logger from "./logger";

setupScheduledTasks();

if (config.env === "production") {
  app.listen(Number(config.port), "0.0.0.0", () => {
    logger.info(`Production server running on http://0.0.0.0:${config.port}`);
  });
} else {
  app.listen(config.port, () => {
    logger.info(
      `Development server running on http://localhost:${config.port}`,
    );
  });
}
