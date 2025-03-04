const requiredEnvVars = ["VITE_CLIENT_ID", "VITE_MODE"];

requiredEnvVars.forEach((varName) => {
  if (!import.meta.env[varName]) {
    console.warn(`Environment variable ${varName} is missing.`);
  }
});

console.log("environment", import.meta.env.VITE_MODE);

const isProd = import.meta.env.VITE_MODE === "production";

export const config = {
  server: isProd
    ? "https://sunday-squad.onrender.com"
    : "http://localhost:5000", //"http://localhost:5000", //"https://sunday-squad.onrender.com",
  redirect_uri: isProd
    ? "https://sunday-heroes.netlify.app/auth/callback"
    : "http://localhost:5000/auth/google/callback",
  google: {
    authEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId: import.meta.env.VITE_CLIENT_ID,
  },
};
