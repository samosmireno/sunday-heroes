import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes/api";
import authRoutes from "./routes/auth";
import { config } from "./config/config";
import errorHandler from "./middleware/error-handler";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin:
      config.env === "production"
        ? "https://sunday-heroes.vercel.app"
        : "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Total-Count"],
  })
);

app.use("/api", apiRoutes);
app.use("/auth", authRoutes);
app.use(errorHandler);

if (config.env === "production") {
  app.listen(Number(config.port), "0.0.0.0", () => {
    console.log(`Production server running on http://0.0.0.0:${config.port}`);
  });
} else {
  app.listen(config.port, () => {
    console.log(
      `Development server running on http://localhost:${config.port}`
    );
  });
}
