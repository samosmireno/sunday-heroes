import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes/api";
import authRoutes from "./routes/auth";
import { config } from "./config/config";
import errorHandler from "./middleware/error-handler";

const app = express();

/*const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || config.cors.allowedOrigins.includes("*")) {
      callback(null, true);
    } else if (config.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));*/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin:
      config.env === "production"
        ? "https://sunday-heroes-client.vercel.app"
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

/*app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});*/

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
