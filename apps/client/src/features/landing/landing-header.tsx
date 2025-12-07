import { useNavigate } from "react-router-dom";

export default function LandingHeader() {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between p-6">
      <div className="flex items-center space-x-3">
        <div className="flex h-12 w-12 items-center justify-center">
          <img
            src="/assets/logo.webp"
            alt="Sunday Heroes Logo"
            className="h-12 w-12 object-contain"
          />
        </div>
        <h1
          className="font-oswald text-2xl font-bold uppercase tracking-wider text-accent"
          style={{ textShadow: "2px 2px 0 #000" }}
        >
          Sunday Heroes
        </h1>
      </div>
      <div className="hidden items-center space-x-4 sm:flex">
        <button
          onClick={() => navigate("/login")}
          className="transform rounded-lg px-6 py-2 font-bold text-accent transition-transform duration-200 hover:translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-bg"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          className="transform rounded-lg border-2 border-accent bg-accent/20 px-6 py-2 font-bold text-accent shadow-md transition-transform duration-200 hover:translate-y-1 hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-bg"
        >
          Sign Up
        </button>
      </div>
    </header>
  );
}
