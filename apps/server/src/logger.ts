import pino from "pino";
import { config } from "./config/config";

// Silent and without the pretty-print transport under test: the transport would
// spawn a worker thread per test file.
const logger =
  config.env === "test"
    ? pino({ level: "silent" })
    : pino({
        level: config.env === "production" ? "info" : "debug",
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      });

export default logger;
