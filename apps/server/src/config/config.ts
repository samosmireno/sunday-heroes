import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "JWT_APP_ACCESS_SECRET",
  "JWT_APP_REFRESH_SECRET",
  "NODE_ENV",
  "PRODUCTION_URL",
  "DEV_SERVER_URL",
  "DEV_CLIENT_URL",
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
const baseUrl = isProd
  ? process.env.PRODUCTION_URL
  : process.env.DEV_SERVER_URL;

export const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  client: isProd ? process.env.PRODUCTION_URL : process.env.DEV_CLIENT_URL,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    accessTokenUrl: "https://oauth2.googleapis.com/token",
    tokenInfoUrl: "https://oauth2.googleapis.com/tokeninfo",
    redirectUri: `${baseUrl}/auth/google/callback`,
    redirectClientUrl: `${baseUrl}/auth/callback`,
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
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  votes: {
    maxVotesPerPlayer: 3,
    pointsDistribution: [3, 2, 1],
    defaultVotingPeriodDays: 7,
  },
};
