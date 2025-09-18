import { Trophy } from "lucide-react";

interface LandingHeaderProps {
  onLogin: () => void;
}

export default function LandingHeader({ onLogin }: LandingHeaderProps) {
  return (
    <header className="flex items-center justify-between p-6">
      <div className="flex items-center space-x-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
          <Trophy className="h-8 w-8 text-accent" />
        </div>
        <h1
          className="font-oswald text-2xl font-bold uppercase tracking-wider text-accent"
          style={{ textShadow: "2px 2px 0 #000" }}
        >
          Sunday Heroes
        </h1>
      </div>
      <button
        onClick={onLogin}
        className="hidden transform rounded-lg border-2 border-accent bg-accent/20 px-6 py-2 font-bold text-accent shadow-md transition-transform duration-200 hover:translate-y-1 hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-bg sm:block"
      >
        Sign In
      </button>
    </header>
  );
}
