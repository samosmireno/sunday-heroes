const requiredEnvVars = ["VITE_CLIENT_ID", "VITE_MODE"] as const;

requiredEnvVars.forEach((varName) => {
  if (!import.meta.env[varName as keyof ImportMetaEnv]) {
    console.warn(`Environment variable ${varName} is missing.`);
  }
});

console.log("environment", import.meta.env.VITE_MODE);

const isProd = import.meta.env.VITE_MODE === "production";

export const config = {
  server: isProd ? "" : "http://localhost:5000",
  redirect_uri: isProd
    ? "https://sunday-heroes.vercel.app/auth/google/callback"
    : "http://localhost:5000/auth/google/callback",
  google: {
    authEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId: import.meta.env.VITE_CLIENT_ID,
  },
  pagination: {
    competition_per_page: 12,
  },
};
