import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes/api";
import authRoutes from "./routes/auth";
import errorHandler from "./middleware/error-handler";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.VERCEL_URL || "https://your-vercel-domain.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Total-Count"],
  })
);

app.use("/api", apiRoutes);
app.use("/auth", authRoutes);
app.use(errorHandler);

export default app;
