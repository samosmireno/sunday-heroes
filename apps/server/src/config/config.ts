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

const smtpEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"];
smtpEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Environment variable ${varName} is not defined`);
  }
});

const isProd = process.env.NODE_ENV === "production";
const baseUrl = isProd
  ? process.env.PRODUCTION_URL
  : process.env.DEV_SERVER_URL;

const redirectBaseUrl = isProd
  ? process.env.PRODUCTION_URL
  : process.env.DEV_CLIENT_URL;

export const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 3001,
  client: isProd ? process.env.PRODUCTION_URL : process.env.DEV_CLIENT_URL,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    accessTokenUrl: "https://oauth2.googleapis.com/token",
    tokenInfoUrl: "https://oauth2.googleapis.com/tokeninfo",
    redirectUri: `${baseUrl}/auth/google/callback`,
    redirectClientUrl: `${redirectBaseUrl}/auth/callback`,
  },
  jwt: {
    accessSecret: process.env.JWT_APP_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_APP_REFRESH_SECRET as string,
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
      : [process.env.ALLOWED_ORIGIN || "*"],
  },
  smtp: {
    host: process.env.SMTP_HOST as string,
    port: process.env.SMTP_PORT as string,
    secure: process.env.SMTP_SECURE,
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASSWORD as string,
  },
  votes: {
    maxVotesPerPlayer: 3,
    pointsDistribution: [3, 2, 1],
    defaultVotingPeriodDays: 7,
  },
};
