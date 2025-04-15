import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "JWT_APP_ACCESS_SECRET",
  "JWT_APP_REFRESH_SECRET",
  "NODE_ENV",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Environment variable ${varName} is not defined`);
  }
});

if (!process.env.JWT_APP_ACCESS_SECRET) {
  throw new Error(
    "JWT_APP_ACCESS_SECRET is not defined in environment variables."
  );
}

if (!process.env.JWT_APP_REFRESH_SECRET) {
  throw new Error(
    "JWT_APP_REFRESH_SECRET is not defined in environment variables."
  );
}

const isProd = process.env.NODE_ENV === "production";

export const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  client: isProd ? "https://sunday-heroes.vercel.app" : "http://localhost:5173",
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    accessTokenUrl: "https://oauth2.googleapis.com/token",
    tokenInfoUrl: "https://oauth2.googleapis.com/tokeninfo",
    redirectUri: isProd
      ? "https://sunday-heroes.vercel.app/auth/google/callback"
      : "http://localhost:5000/auth/google/callback",
    redirectClientUrl: isProd
      ? "https://sunday-heroes.vercel.app/auth/callback"
      : "http://localhost:5173/auth/callback",
  },
  jwt: {
    accessSecret: process.env.JWT_APP_ACCESS_SECRET,
    refreshSecret: process.env.JWT_APP_REFRESH_SECRET,
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
      : [process.env.ALLOWED_ORIGIN || "*"],
  },
};
