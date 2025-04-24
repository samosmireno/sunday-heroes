import { Home, Frown } from "lucide-react";
import { Link } from "react-router-dom";

export default function ErrorPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-secondary">
      <div
        className="pointer-events-none fixed inset-0 z-50 bg-repeat"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0.03) 2px)",
        }}
      ></div>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(45deg, rgba(0,0,0,0.2) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2) 75%, transparent 75%, transparent)",
          backgroundSize: "10px 10px",
        }}
      ></div>

      <div className="z-10 flex max-w-lg flex-col items-center rounded-lg border-2 border-accent bg-panel-bg p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
          <Frown className="h-12 w-12 text-accent" />
        </div>
        <h1
          className="mb-3 text-3xl font-bold uppercase tracking-wider text-accent sm:text-4xl"
          style={{ textShadow: "2px 2px 0 #000" }}
        >
          404 Not Found
        </h1>
        <p className="mb-6 text-center text-gray-300">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="transform rounded-lg border-2 border-accent bg-accent/20 px-6 py-3 font-bold text-accent transition-transform duration-200 hover:translate-y-1 hover:bg-accent/30 focus:outline-none"
        >
          <div className="flex items-center">
            <Home className="mr-2 h-5 w-5" />
            Return to Dashboard
          </div>
        </Link>
      </div>
    </div>
  );
}
