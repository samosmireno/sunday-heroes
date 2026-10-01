import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes/api";
import authRoutes from "./routes/auth";
import { config } from "./config/config";
import { errorHandler } from "./middleware/error-handler";
import { readOnlyGuard } from "./middleware/read-only";
import path from "path";
import pinoHttp from "pino-http";
import logger from "./logger";
import pinoHttpConfig from "./config/pino-http-config";

// The Express app without the listener or the scheduled tasks, so a test can
// mount it as production does.
const app = express();

app.use(pinoHttp({ logger, ...pinoHttpConfig }));

if (config.env === "production") {
  app.set("trust proxy", 1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: config.client,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Total-Count"],
  }),
);

// After the body parsers (it strips an invite token from a login body), before
// every route.
app.use(readOnlyGuard);

app.use("/api", apiRoutes);
app.use("/auth", authRoutes);

if (config.env === "production") {
  // Serve static files from the client build
  const clientBuildPath = path.join(__dirname, "../client");
  app.use(express.static(clientBuildPath));

  // Catch-all handler: send back React's index.html file for client-side routing
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

app.use(errorHandler);

export default app;
