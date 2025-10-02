const requiredEnvVars = [
  "VITE_CLIENT_ID",
  "VITE_MODE",
  "VITE_SERVER_DEV_URL",
  "VITE_SERVER_PROD_URL",
] as const;

requiredEnvVars.forEach((varName) => {
  if (!import.meta.env[varName as keyof ImportMetaEnv]) {
    console.warn(`Environment variable ${varName} is missing.`);
  }
});

const isProd = import.meta.env.VITE_MODE === "production";

export const config = {
  server: isProd
    ? import.meta.env.VITE_SERVER_PROD_URL
    : import.meta.env.VITE_SERVER_DEV_URL,
  redirect_uri: isProd
    ? `${import.meta.env.VITE_SERVER_PROD_URL}/auth/google/callback`
    : `${import.meta.env.VITE_SERVER_DEV_URL}/auth/google/callback`,
  google: {
    authEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId: import.meta.env.VITE_CLIENT_ID,
  },
  pagination: {
    competition_per_page: 12,
    matches_per_page: 10,
    players_per_page: 10,
  },
  voting: {
    allowedValues: [3, 2, 1],
    maxVotesPerPlayer: 3,
  },
};
